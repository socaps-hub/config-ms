import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Calificativo, Figura, Movimiento, PrismaClient, ResFaseII } from '@prisma/client';
import { ExcelService } from 'src/common/excel/services/excel.service';
import { ExcelRowMapper } from './helpers/excel-row-mapper.helper';
import { BooleanResponse } from 'src/common/dto/boolean-response.object';
import { MigracionRequestInput } from './dto/input/migracion-request.input';
import { M01ControlMigracion } from './entities/control-migracion.entity';
import { ExcelUtils } from 'src/common/excel/utils/excel.utils';
import { RpcException } from '@nestjs/microservices';
import { GrupoTipo } from 'src/common/enums/grupo-type-enum';
import { formatYYYYMMDD, getFechaMexicoISO } from 'src/common/excel/utils/date.util';

@Injectable()
export class MigracionService extends PrismaClient implements OnModuleInit {

    private readonly _logger = new Logger('MigracionService');
    private router = {
        "SISCONCRE:F1": this._procesarMigracionF1.bind(this),
        "SISCONCRE:F2": this._procesarMigracionF2.bind(this),
        "SISCONCRE:F3": this._procesarMigracionF3.bind(this),
        "SISCONCRE:F4": this._procesarMigracionF4.bind(this),

        "SISCONCAP:F1": this._procesarMigracionSisconcapF1.bind(this),
        "SISCONCAP:F2": this._procesarMigracionSisconcapF2.bind(this),
        "SISCONCAP:F3": this._procesarMigracionSisconcapF3.bind(this),
    };

    constructor(
        private readonly excelService: ExcelService,
    ) {
        super();
    }

    async onModuleInit() {
        await this.$connect();
        this._logger.log('Database connected');
    }

    //* CONTROL DE MIGRACIONES
    public async getAllControlMigrations(): Promise<M01ControlMigracion[]> {
        const migraciones = await this.m01ControlMigracion.findMany({
            orderBy: { M01Fecha: 'desc' },
            select: {
                M01Id: true,
                M01Coop_id: true,
                M01Sistema: true,
                M01Fase: true,
                M01Archivo: true,
                M01Fecha: true,
                M01Total: true,
                M01Correctos: true,
                M01Errores: true,
                M01Estado: true,
                cooperativa: true,
            },
        });

        // Convertir fecha a ISOString para ajustar al schema GraphQL
        return migraciones.map((m) => ({
            ...m,
            M01Fecha: formatYYYYMMDD(m.M01Fecha),
        }));
    }

    public async getControlMigrationById(id: number): Promise<M01ControlMigracion> {
        const migracion = await this.m01ControlMigracion.findUnique({
            where: { M01Id: id },
            include: { cooperativa: true }, // aquí sí
        });

        if (!migracion) {
            throw new RpcException({
                message: `Control de migración con id ${id} no existe`,
                status: HttpStatus.NOT_FOUND
            })
        };

        return {
            ...migracion,
            M01Fecha: formatYYYYMMDD(migracion.M01Fecha),
            M01Log: migracion.M01Log ?? undefined
        };
    }

    public async ejecutarMigracion(input: MigracionRequestInput) {
        const key = `${input.sistema}:${input.fase}`;
        const handler = this.router[key];

        if (!handler)
            throw new Error(`Migración no implementada: ${key}`);

        return handler(input);
    }

    // * SISCONCRE F1
    /**
     * Procesa una migración completa de Fase 1 (Sisconcre).
     * Escalable a miles de registros:
     *  - Pre-carga catálogos en memoria (sucursales, categorías, productos, usuarios, elementos)
     *  - Usa Maps para lookups O(1)
     *  - Usa transacción POR FILA (no una mega-transacción)
     *  - Usa createMany para las evaluaciones R05
     *  - Calcula el resumen R06 en memoria (sin SELECT adicional)
     */
    private async _procesarMigracionF1(input: MigracionRequestInput): Promise<BooleanResponse> {
        try {
            const { key, cooperativaId, sistema, fase } = input;

            this._logger.log(
                `🚀 Iniciando migración F1 → Coop: ${cooperativaId}, Sistema: ${sistema}, Archivo: ${key}`,
            );

            // ==========================
            // 1️⃣ Leer Excel desde S3
            // ==========================
            const rows = await this.excelService.readExcelAsJsonFromS3(key);

            if (!rows || rows.length === 0) {
                return {
                    success: false,
                    message: 'El archivo de migración está vacío.',
                };
            }

            // ==========================
            // 2️⃣ Crear control inicial M01
            // ==========================
            const control = await this.m01ControlMigracion.create({
                data: {
                    M01Coop_id: cooperativaId,
                    M01Sistema: sistema,
                    M01Fase: fase,
                    M01Archivo: key.split('/').pop()!,
                    M01Estado: 'EN_PROCESO',
                    M01Total: rows.length,
                    M01Correctos: 0,
                    M01Errores: 0,
                    M01Log: '',
                },
            });

            // ==========================
            // 3️⃣ Pre-cargar catálogos en memoria
            //    (solo 1 vez, sin repetir por fila)
            // ==========================
            // Conjunto de préstamos que vienen en el Excel
            const prestamosNumsSet = new Set<string>();
            for (const row of rows) {
                const rawNum = row['Num Prestamo']?.toString() ?? '';
                if (!rawNum) continue;
                const num = rawNum.padStart(8, '0');
                prestamosNumsSet.add(num);
            }
            const prestamosNums = Array.from(prestamosNumsSet);

            const [prestamos, sucursales, categorias, productos, usuarios, elementos] =
                await this.$transaction([
                    // Préstamos existentes de la coop que estén en el Excel
                    this.r01Prestamo.findMany({
                        where: {
                            R01Coop_id: cooperativaId,
                            R01NUM: { in: prestamosNums },
                        },
                    }),
                    this.r11Sucursal.findMany({
                        where: { R11Coop_id: cooperativaId },
                    }),
                    this.r14Categoria.findMany({}),
                    this.r13Producto.findMany({
                        where: { R13Coop_id: cooperativaId },
                    }),
                    this.r12Usuario.findMany({
                        where: { R12Coop_id: cooperativaId },
                    }),
                    this.r04Elemento.findMany({
                        where: {
                            rubro: {
                                grupo: {
                                    R02Coop_id: cooperativaId,
                                    // opcional: filtrar por tipo de grupo
                                    // R02Tipo: 'SISCONCRE'
                                },
                            },
                        },
                    }),
                ]);

            // ==========================
            // 4️⃣ Construir Mapas para lookups O(1)
            // ==========================

            // Préstamo por número
            const mapaPrestamos = new Map<string, (typeof prestamos)[0]>();
            prestamos.forEach((p) => {
                mapaPrestamos.set(p.R01NUM, p);
            });

            // sucursalNum (ej. "01") → sucursal
            const mapaSucursales = new Map<string, (typeof sucursales)[0]>();
            sucursales.forEach((s) => {
                const key = (s.R11NumSuc ?? '').toString().trim().toUpperCase();
                if (key) mapaSucursales.set(key, s);
            });

            // nombre categoría (normalizado) → categoría
            const mapaCategorias = new Map<string, (typeof categorias)[0]>();
            categorias.forEach((c) => {
                const key = (c.R14Nom ?? '').toString().trim().toUpperCase();
                if (key) mapaCategorias.set(key, c);
            });

            // nombre producto (normalizado) → producto
            const mapaProductos = new Map<string, (typeof productos)[0]>();
            productos.forEach((p) => {
                const key = (p.R13Nom ?? '').toString().trim().toUpperCase();
                if (key) mapaProductos.set(key, p);
            });

            // NI usuario (normalizado) → usuario
            const mapaUsuarios = new Map<string, (typeof usuarios)[0]>();
            usuarios.forEach((u) => {
                const key = (u.R12Ni ?? '').toString().trim().toUpperCase();
                if (key) mapaUsuarios.set(key, u);
            });

            // código de elemento → elemento
            const mapaElementos = new Map<string, (typeof elementos)[0]>();
            elementos.forEach((e) => {
                if (e.R04Codigo) {
                    mapaElementos.set(e.R04Codigo, e);
                }
            });

            let correctos = 0;
            let errores = 0;
            const erroresLog: string[] = [];

            // ==========================
            // 5️⃣ Procesar fila por fila
            //    → transacción POR FILA (atomicidad por préstamo)
            // ==========================
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];

                try {
                    await this.$transaction(
                        async (tx) => {
                            // ---------------------------
                            // a) Crear R01 desde Excel usando los catálogos en memoria
                            // ---------------------------
                            const prestamo = await this.crearR01DesdeExcel(
                                row,
                                cooperativaId,
                                tx,
                                {
                                    mapaPrestamos,
                                    mapaSucursales,
                                    mapaCategorias,
                                    mapaProductos,
                                    mapaUsuarios,
                                },
                            );

                            // Supervisor necesario (ya ubicado en crearR01DesdeExcel)
                            const supervisorNi = row['Clave Supervisor']?.toString().trim() ?? '';
                            const supervisorKey = supervisorNi.toUpperCase();
                            const supervisor = mapaUsuarios.get(supervisorKey);
                            if (!supervisor) {
                                throw new Error(
                                    `Supervisor no encontrado para evaluaciones: ${supervisorNi}`,
                                );
                            }

                            // ---------------------------
                            // b) Crear R05 (evaluaciones) y calcular Ha, Hm, Hb, Rc en memoria
                            // ---------------------------
                            const { Ha, Hm, Hb, Rc } = await this.crearEvaluacionesR05(
                                row,
                                prestamo.R01Id,
                                tx,
                                supervisor.R12Id,
                                cooperativaId,
                                mapaElementos,
                            );

                            // ---------------------------
                            // c) Crear R06 (resumen) REUSANDO los contadores ya calculados
                            // ---------------------------
                            await this.crearResumenR06(
                                prestamo.R01Id,
                                tx,
                                supervisor.R12Id,
                                { Ha, Hm, Hb, Rc },
                            );
                        },
                        { timeout: 20_000 }, // timeout razonable por fila
                    );

                    correctos++;
                } catch (error: any) {
                    errores++;
                    const mensaje = `Fila ${i + 1}: ${error?.message || error}`;
                    erroresLog.push(mensaje);
                    this._logger.error(`❌ Error fila ${mensaje}`);
                }
            }

            // ==========================
            // 6️⃣ Actualizar control M01 con resumen final
            // ==========================
            await this.m01ControlMigracion.update({
                where: { M01Id: control.M01Id },
                data: {
                    M01Correctos: correctos,
                    M01Errores: errores,
                    M01Estado: errores > 0 ? 'COMPLETADO_CON_ERRORES' : 'COMPLETADO',
                    M01Log: erroresLog.join('\n'),
                },
            });

            // ==========================
            // 7️⃣ Respuesta final al frontend
            // ==========================
            this._logger.log(
                `🏁 Migración F1 Finalizada: Correctos=${correctos}, Errores=${errores}`,
            );

            return {
                success: errores === 0,
                message:
                    errores > 0
                        ? `Migración completada con ${errores} errores.`
                        : 'Migración completada exitosamente.',
                data: {
                    total: rows.length,
                    correctos,
                    errores,
                    controlId: control.M01Id,
                },
            };
        } catch (error: any) {
            this._logger.error(`🔥 Error fatal en migración: ${error.message}`);

            return {
                success: false,
                message: `Error en migración: ${error.message}`,
            };
        }
    }

    // ============================================================
    // 🔹 Helpers de construcción de entidades
    // ============================================================

    /**
     * Construye un registro R01Prestamo desde una fila del Excel usando
     * catálogos precargados en memoria (sin queries adicionales).
     */
    async crearR01DesdeExcel(
        row: any,
        cooperativaId: string,
        tx: any,
        maps: {
            mapaPrestamos: Map<string, any>;
            mapaSucursales: Map<string, any>;
            mapaCategorias: Map<string, any>;
            mapaProductos: Map<string, any>;
            mapaUsuarios: Map<string, any>;
        },
    ) {
        const { mapaPrestamos, mapaSucursales, mapaCategorias, mapaProductos, mapaUsuarios } = maps;

        // ---------------------------
        // a) Validar que exista el préstamo (R01) y el resumen F1 (R06)
        // ---------------------------
        const rawNum = row['Num Prestamo']?.toString() ?? '';
        const prestamoNum = rawNum.padStart(8, '0');

        const prestamo = mapaPrestamos.get(prestamoNum);
        if (prestamo) {
            throw new Error(`N° de Préstamo ${prestamo.R01NUM} ya existente`);
        }

        // 1) Sucursal por número
        const sucursalNum = row['Sucursal']?.toString().trim() ?? '';
        const sucursalKey = sucursalNum.toUpperCase();
        const sucursal = mapaSucursales.get(sucursalKey);
        if (!sucursal) {
            throw new Error(`Sucursal no encontrada: ${sucursalNum}`);
        }

        // 2) Categoría por nombre
        const categoriaNom = row['Categoria']?.toString().trim() ?? '';
        const categoriaKey = categoriaNom.toUpperCase();
        const categoria = mapaCategorias.get(categoriaKey);
        if (!categoria) {
            throw new Error(`Categoría no encontrada: ${categoriaNom}`);
        }

        // 3) Producto por nombre
        const productoNom = row['Producto']?.toString().trim() ?? '';
        const productoKey = productoNom.toUpperCase();
        const producto = mapaProductos.get(productoKey);
        if (!producto) {
            throw new Error(`Producto no encontrado: ${productoNom}`);
        }

        // 4) Supervisor por NI
        const supervisorNi = row['Clave Supervisor']?.toString().trim() ?? '';
        const supervisorKey = supervisorNi.toUpperCase();
        const supervisor = mapaUsuarios.get(supervisorKey);
        if (!supervisor) {
            throw new Error(`Supervisor no encontrado (NI): ${supervisorNi}`);
        }

        // 5) Ejecutivo por NI
        const ejecutivoNi = row['Clave Usuario']?.toString().trim() ?? '';
        const ejecutivoKey = ejecutivoNi.toUpperCase();
        const ejecutivo = mapaUsuarios.get(ejecutivoKey);
        if (!ejecutivo) {
            throw new Error(`Ejecutivo no encontrado (NI): ${ejecutivoNi}`);
        }

        // 6) Crear PRÉSTAMO R01
        return tx.r01Prestamo.create({
            data: {
                R01NUM: row['Num Prestamo']?.toString().padStart(8, '0'),
                R01Suc_id: sucursal.R11Id,
                R01Nso: row['CAG']?.toString() ?? '',
                R01Nom: row['Nombre']?.toString() ?? '',
                R01Cat_id: categoria.R14Id,
                R01Pro_id: producto.R13Id,
                R01Imp: Number(row['Importe'] ?? 0),
                R01Dir: row['Directo a Seguimiento']?.toString() ?? '',
                R01SP_id: supervisor.R12Id,
                R01Ejvo_id: ejecutivo.R12Id,
                R01Fsol: ExcelUtils.parseExcelDate(row['Fecha Solicitud']) ?? '',
                R01FRec: ExcelUtils.parseExcelDate(row['Fecha Recepcion']) ?? '',
                R01FRev: ExcelUtils.parseExcelDate(row['Fecha Revision']) ?? '',
                R01FMov: ExcelUtils.parseExcelDate(row['Fecha Movimiento']) ?? '',
                R01ObsA: row['Alto']?.toString() ?? '',
                R01ObsM: row['Medio']?.toString() ?? '',
                R01ObsB: row['Bajo']?.toString() ?? '',
                R01ObsT: row['Observaciones Todas']?.toString() ?? '',
                R01Notas: '',
                R01Est: 'Sin seguimiento',
                R01Activ: true,
                R01Coop_id: cooperativaId,
            },
        });
    }

    /**
     * Crea las evaluaciones elemento por elemento (R05).
     * Optimizado:
     *  - Solo procesa columnas mapeadas en ExcelRowMapper
     *  - Usa elementos precargados en memoria (mapaElementos)
     *  - Usa createMany en vez de create uno a uno
     *  - Devuelve contadores Ha, Hm, Hb, Rc para usarlos en R06
     */
    async crearEvaluacionesR05(
        row: any,
        prestamoId: string,
        tx: any,
        supervisorId: string,
        cooperativaId: string,
        mapaElementos: Map<string, any>,
    ): Promise<{ Ha: number; Hm: number; Hb: number; Rc: number }> {
        const evaluacionesData: {
            R05P_id: string;
            R05E_id: string;
            R05Res: any;
            R05Ev_por: string;
            R05Ev_en: string;
        }[] = [];

        let Ha = 0;
        let Hm = 0;
        let Hb = 0;
        let Rc = 0;

        for (const columna in row) {
            // 1. Obtener código permanente a partir del nombre de columna
            const codigo = ExcelRowMapper.obtenerCodigoElemento(columna.toUpperCase());
            if (!codigo) continue;

            // 2. Buscar elemento en el mapa precargado
            const elemento = mapaElementos.get(codigo);
            if (!elemento) {
                // Puedes cambiar esto por un "continue" si no quieres tumbar toda la fila
                throw new Error(`Elemento no encontrado por el código ${columna}`);
            }

            // 3. Convertir letra del Excel a Enum (P/W/...)
            const valorExcel = (row[columna] || '').toString().trim().toUpperCase();
            const resultado = this._mapearResultadoF1(valorExcel);

            // 4. Contabilizar Ha, Hm, Hb, Rc en memoria (sin query)
            if (resultado === 'I') {
                // Impacto según el elemento
                const impacto = (elemento.R04Imp || '').toString().toUpperCase();
                if (impacto === 'ALTO' || impacto === 'A') Ha++;
                else if (impacto === 'MEDIO' || impacto === 'M') Hm++;
                else if (impacto === 'BAJO' || impacto === 'B') Hb++;
            } else if (resultado === 'C' || resultado === 'NA') {
                Rc++;
            }

            // 5. Armar registro para createMany
            evaluacionesData.push({
                R05P_id: prestamoId,
                R05E_id: elemento.R04Id,
                R05Res: resultado,
                R05Ev_por: supervisorId,
                R05Ev_en: getFechaMexicoISO(),
            });
        }

        // 6. Inserción masiva de evaluaciones (si hay)
        if (evaluacionesData.length > 0) {
            await tx.r05EvaluacionFase1.createMany({
                data: evaluacionesData,
            });
        }

        return { Ha, Hm, Hb, Rc };
    }

    /**
     * Crea el resumen R06EvaluacionResumenFase1 usando los contadores
     * calculados previamente (Ha, Hm, Hb, Rc), sin hacer SELECT adicional.
     */
    async crearResumenR06(
        prestamoId: string,
        tx: any,
        supervisorId: string,
        counters: { Ha: number; Hm: number; Hb: number; Rc: number },
    ) {
        const { Ha, Hm, Hb, Rc } = counters;

        const calificativo = this._obtenerCalificativo(Ha, Hm, Hb);
        const resolucion = calificativo !== 'DEFICIENTE' ? 'PASA_COMITE' : 'DEVUELTA';

        return tx.r06EvaluacionResumenFase1.create({
            data: {
                R06P_id: prestamoId,
                R06Ha: Ha,
                R06Hm: Hm,
                R06Hb: Hb,
                R06Rc: Rc,
                R06Cal: calificativo,
                R06Res: resolucion,
                R06Ev_por: supervisorId,
            },
        });
    }

    // ============================================================
    // 🔹 Utilidades internas de mapeo
    // ============================================================

    private _mapearResultadoF1(valor: string) {
        switch (valor) {
            case 'P':
                return 'C';
            case 'O':
                return 'I';
            default:
                return 'NA';
        }
    }

    private _obtenerCalificativo(Ha: number, Hm: number, Hb: number) {
        if (Ha > 0) return 'DEFICIENTE';
        if (Hm > 0) return 'ACEPTABLE';
        if (Hb > 0) return 'ACEPTABLE';
        return 'CORRECTO';
    }


    // * SISCONCRE F2
    /**
     * Procesa una migración completa de Fase 2 (Sisconcre).
     *
     * Reglas:
     *  - Códigos en Excel:
     *      P -> C   (Cumple)
     *      O -> I   (Incumple)
     *      R -> S   (Solventado)
     *      T -> NS  (No solventado)
     *      (cualquier otro, incl. W) -> NA
     *
     *  - Calificativo F2:
     *      hallazgosF1 = Ha + Hm + Hb (de R06)
     *      solvT = SolvA + SolvM + SolvB (de F2)
     *
     *      Si solvT === hallazgosF1 -> CORRECTO
     *      En caso contrario        -> DEFICIENTE
     */
    private async _procesarMigracionF2(input: MigracionRequestInput): Promise<BooleanResponse> {
        try {
            const { key, cooperativaId, sistema, fase } = input;

            this._logger.log(
                `🚀 Iniciando migración F2 → Coop: ${cooperativaId}, Sistema: ${sistema}, Archivo: ${key}`,
            );

            // ==========================
            // 1️⃣ Leer Excel desde S3
            // ==========================
            const rows = await this.excelService.readExcelAsJsonFromS3(key);

            if (!rows || rows.length === 0) {
                return {
                    success: false,
                    message: 'El archivo de migración F2 está vacío.',
                };
            }

            // ==========================
            // 2️⃣ Crear control inicial M01
            // ==========================
            const control = await this.m01ControlMigracion.create({
                data: {
                    M01Coop_id: cooperativaId,
                    M01Sistema: sistema,
                    M01Fase: fase,
                    M01Archivo: key.split('/').pop()!,
                    M01Estado: 'EN_PROCESO',
                    M01Total: rows.length,
                    M01Correctos: 0,
                    M01Errores: 0,
                    M01Log: '',
                },
            });

            // ==========================
            // 3️⃣ Pre-carga de catálogos
            //    (solo 1 vez)
            // ==========================

            // Conjunto de préstamos que vienen en el Excel
            const prestamosNumsSet = new Set<string>();
            for (const row of rows) {
                const rawNum = row['Num Prestamo']?.toString() ?? '';
                if (!rawNum) continue;
                const num = rawNum.padStart(8, '0');
                prestamosNumsSet.add(num);
            }
            const prestamosNums = Array.from(prestamosNumsSet);

            const [prestamos, usuarios, elementos, resF1List] = await this.$transaction([
                // Préstamos existentes de la coop que estén en el Excel
                this.r01Prestamo.findMany({
                    where: {
                        R01Coop_id: cooperativaId,
                        R01NUM: { in: prestamosNums },
                    },
                }),
                // Usuarios de la cooperativa (para supervisor F2)
                this.r12Usuario.findMany({
                    where: { R12Coop_id: cooperativaId },
                }),
                // Elementos de la cooperativa (mismo catálogo que F1)
                this.r04Elemento.findMany({
                    where: {
                        rubro: {
                            grupo: {
                                R02Coop_id: cooperativaId,
                                // R02Tipo: 'SISCONCRE' // opcional
                            },
                        },
                    },
                }),
                // Resúmenes de F1 para estos préstamos
                this.r06EvaluacionResumenFase1.findMany({
                    where: {
                        prestamo: { R01NUM: { in: prestamosNums }, }
                    },
                }),
            ]);

            // ==========================
            // 4️⃣ Mapas en memoria
            // ==========================

            // Préstamo por número
            const mapaPrestamos = new Map<string, (typeof prestamos)[0]>();
            prestamos.forEach((p) => {
                mapaPrestamos.set(p.R01NUM, p);
            });

            // Usuario por NI (Supervisor en F2)
            const mapaUsuarios = new Map<string, (typeof usuarios)[0]>();
            usuarios.forEach((u) => {
                const keyNI = (u.R12Ni ?? '').toString().trim().toUpperCase();
                if (keyNI) mapaUsuarios.set(keyNI, u);
            });

            // Elemento por código (R04Codigo)
            const mapaElementos = new Map<string, (typeof elementos)[0]>();
            elementos.forEach((e) => {
                if (e.R04Codigo) mapaElementos.set(e.R04Codigo, e);
            });

            // Resumen F1 por préstamo
            const mapaResumenF1 = new Map<
                string,
                (typeof resF1List)[0] & { hallazgosTotales: number }
            >();
            resF1List.forEach((r) => {
                const hallazgosTotales = (r.R06Ha ?? 0) + (r.R06Hm ?? 0) + (r.R06Hb ?? 0);
                mapaResumenF1.set(r.R06P_id, { ...r, hallazgosTotales });
            });

            let correctos = 0;
            let errores = 0;
            const erroresLog: string[] = [];

            // ==========================
            // 5️⃣ Procesar fila por fila
            //    → transacción POR FILA
            // ==========================
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];

                try {
                    await this.$transaction(
                        async (tx) => {
                            // ---------------------------
                            // a) Validar que exista el préstamo (R01) y el resumen F1 (R06)
                            // ---------------------------
                            const rawNum = row['Num Prestamo']?.toString() ?? '';
                            const prestamoNum = rawNum.padStart(8, '0');

                            const prestamo = mapaPrestamos.get(prestamoNum);
                            if (!prestamo) {
                                throw new Error(
                                    `Préstamo (R01) no encontrado para Num Prestamo: ${rawNum}`,
                                );
                            }

                            const resumenF1 = mapaResumenF1.get(prestamo.R01Id);
                            if (!resumenF1) {
                                throw new Error(
                                    `Resumen F1 (R06) no encontrado para préstamo: ${prestamoNum}`,
                                );
                            }

                            // ---------------------------
                            // b) Supervisor F2 por NI (columna 'Supervisor')
                            // ---------------------------
                            const supervisorNi = row['Supervisor']?.toString().trim() ?? '';
                            const supervisorKey = supervisorNi.toUpperCase();
                            const supervisor = mapaUsuarios.get(supervisorKey);
                            if (!supervisor) {
                                throw new Error(`Supervisor F2 no encontrado (NI): ${supervisorNi}`);
                            }

                            // ---------------------------
                            // c) Crear evaluaciones R07 (F2) + contadores
                            // ---------------------------
                            const counters = await this.crearEvaluacionesR07(
                                row,
                                prestamo.R01Id,
                                tx,
                                supervisor.R12Id,
                                mapaElementos,
                            );

                            // ---------------------------
                            // d) Crear resumen R08 (usando counters + resumen F1)
                            // ---------------------------
                            await this.crearResumenR08(
                                row,
                                prestamo.R01Id,
                                tx,
                                supervisor.R12Id,
                                counters,
                                resumenF1,
                            );

                            // Actualizar a R01Est correspondiente
                            await tx.r01Prestamo.update({
                                where: { R01Id: prestamo.R01Id },
                                data: { R01Est: 'Con seguimiento' },
                            })
                        },
                        { timeout: 20_000 },
                    );

                    correctos++;
                } catch (error: any) {
                    errores++;
                    const mensaje = `Fila ${i + 1}: ${error?.message || error}`;
                    erroresLog.push(mensaje);
                    this._logger.error(`❌ Error fila ${mensaje}`);
                }
            }

            // ==========================
            // 6️⃣ Actualizar control M01
            // ==========================
            await this.m01ControlMigracion.update({
                where: { M01Id: control.M01Id },
                data: {
                    M01Correctos: correctos,
                    M01Errores: errores,
                    M01Estado: errores > 0 ? 'COMPLETADO_CON_ERRORES' : 'COMPLETADO',
                    M01Log: erroresLog.join('\n'),
                },
            });

            // ==========================
            // 7️⃣ Respuesta final
            // ==========================
            this._logger.log(
                `🏁 Migración F2 Finalizada: Correctos=${correctos}, Errores=${errores}`,
            );

            return {
                success: errores === 0,
                message:
                    errores > 0
                        ? `Migración F2 completada con ${errores} errores.`
                        : 'Migración F2 completada exitosamente.',
                data: {
                    total: rows.length,
                    correctos,
                    errores,
                    controlId: control.M01Id,
                },
            };
        } catch (error: any) {
            this._logger.error(`🔥 Error fatal en migración F2: ${error.message}`);

            return {
                success: false,
                message: `Error en migración F2: ${error.message}`,
            };
        }
    }


    /**
     * Crea las evaluaciones de Fase 2 (R07EvaluacionFase2).
     *
     * Optimizado:
     *  - Solo procesa columnas que estén mapeadas en ExcelRowMapper
     *  - Usa elementos precargados en memoria (mapaElementos)
     *  - Usa createMany
     *  - Devuelve:
     *      SolvA, SolvM, SolvB, SolvT (total), Rc
     */
    async crearEvaluacionesR07(
        row: any,
        prestamoId: string,
        tx: any,
        supervisorId: string,
        mapaElementos: Map<string, any>,
    ): Promise<{ SolvA: number; SolvM: number; SolvB: number; SolvT: number; Rc: number }> {
        const evaluacionesData: {
            R07P_id: string;
            R07E_id: string;
            R07Res: any;      // ResFaseII
            R07Ev_por: string;
            R07Ev_en: string;
        }[] = [];

        let SolvA = 0;
        let SolvM = 0;
        let SolvB = 0;
        let Rc = 0;

        for (const columna in row) {
            // 1️⃣ Obtener código permanente desde el nombre de la columna
            const codigo = ExcelRowMapper.obtenerCodigoElemento(columna.toUpperCase());
            if (!codigo) continue;

            // 2️⃣ Buscar elemento en el mapa precargado
            const elemento = mapaElementos.get(codigo);
            if (!elemento) {
                // Puedes cambiar por "continue" si prefieres no tumbar la fila
                throw new Error(`Elemento F2 no encontrado por el código ${columna}`);
            }

            // 3️⃣ Valor en Excel (P, O, R, T, W, etc.)
            const valorExcel = (row[columna] || '').toString().trim().toUpperCase();
            if (!valorExcel) continue;

            const resultado = this._mapearResultadoF2(valorExcel);

            // 4️⃣ Contadores:
            //    - Solventado: R07Res = 'S'
            //    - Correcto:   R07Res = 'C'
            if (resultado === 'S') {
                const impacto = (elemento.R04Imp || '').toString().toUpperCase();
                Rc++;
                if (impacto === 'ALTO' || impacto === 'A') SolvA++;
                else if (impacto === 'MEDIO' || impacto === 'M') SolvM++;
                else if (impacto === 'BAJO' || impacto === 'B') SolvB++;
            } else if (resultado === 'C' || resultado === 'NA') {
                Rc++;
            }

            const fechaSeg = ExcelUtils.parseExcelDate(row['Fecha Seguimiento']) ?? ''

            // 5️⃣ Armar registro para createMany
            evaluacionesData.push({
                R07P_id: prestamoId,
                R07E_id: elemento.R04Id,
                R07Res: resultado,
                R07Ev_por: supervisorId,
                R07Ev_en: fechaSeg,
            });
        }

        // 6️⃣ Inserción masiva
        if (evaluacionesData.length > 0) {
            await tx.r07EvaluacionFase2.createMany({
                data: evaluacionesData,
            });
        }

        const SolvT = SolvA + SolvM + SolvB;

        return { SolvA, SolvM, SolvB, SolvT, Rc };
    }

    /**
 * Crea el resumen de Fase 2 (R08EvaluacionResumenFase2)
 * usando:
 *  - Contadores de F2: SolvA, SolvM, SolvB, SolvT, Rc
 *  - Resumen de F1: Ha, Hm, Hb (hallazgos)
 */
    async crearResumenR08(
        row: any,
        prestamoId: string,
        tx: any,
        supervisorId: string,
        counters: { SolvA: number; SolvM: number; SolvB: number; SolvT: number; Rc: number },
        resumenF1: { R06Ha: number; R06Hm: number; R06Hb: number; hallazgosTotales: number },
    ) {
        const { SolvA, SolvM, SolvB, SolvT, Rc } = counters;

        const hallazgosTotales = resumenF1.hallazgosTotales;

        const calificativo = this._obtenerCalificativoF2(SolvT, hallazgosTotales);
        const resolucion = calificativo !== 'DEFICIENTE' ? 'PASA_COMITE' : 'DEVUELTA';

        const observaciones =
            row['Observaciones Al Seguimiento']?.toString() ?? '';

        const fechaSeguimiento =
            ExcelUtils.parseExcelDate(row['Fecha Seguimiento']) ?? '';

        return tx.r08EvaluacionResumenFase2.create({
            data: {
                R08P_id: prestamoId,
                R08SolvT: SolvT,
                R08SolvA: SolvA,
                R08SolvM: SolvM,
                R08SolvB: SolvB,
                R08Rc: Rc,
                R08Cal: calificativo,
                R08Res: resolucion,
                R08Obs: observaciones,
                R08FSeg: fechaSeguimiento,
                R08Ev_por: supervisorId,
            },
        });
    }


    /**
     * Mapea los códigos de Excel F2 a ResFaseII:
     *
     *  P -> C   (Cumple)
     *  O -> I   (Incumple)
     *  R -> S   (Solventado)
     *  T -> NS  (No solventado)
     *  (cualquier otro, incl. W) -> NA
     */
    private _mapearResultadoF2(valor: string) {
        switch (valor) {
            case 'P':
                return 'C';
            case 'O':
                return 'I';
            case 'R':
                return 'S';
            case 'T':
                return 'NS';
            default:
                return 'NA';
        }
    }

    /**
     * Calificativo F2:
     *  - Si todos los hallazgos de F1 fueron solventados → CORRECTO
     *  - Si queda al menos un hallazgo sin solventar      → DEFICIENTE
     */
    private _obtenerCalificativoF2(solvT: number, hallazgosF1: number) {
        if (hallazgosF1 <= 0) {
            // Sin hallazgos en F1 → por diseño podríamos considerarlo CORRECTO
            return 'CORRECTO';
        }

        if (solvT === hallazgosF1) {
            return 'CORRECTO';
        }

        return 'DEFICIENTE';
    }


    // * SISCONCRE F3

    // ==========================================
    // 🔥 MIGRACIÓN SISCONCRE F3 (Desembolso)
    // ==========================================
    private async _procesarMigracionF3(input: MigracionRequestInput): Promise<BooleanResponse> {
        try {
            const { key, cooperativaId, sistema, fase } = input;

            this._logger.log(`🚀 Iniciando migración F3 → Coop: ${cooperativaId}, Archivo: ${key}`);

            // 1) Leer Excel
            const rows = await this.excelService.readExcelAsJsonFromS3(key);
            if (!rows || rows.length === 0) {
                return { success: false, message: "Archivo vacío" };
            }

            // 2) Crear control inicial
            const control = await this.m01ControlMigracion.create({
                data: {
                    M01Coop_id: cooperativaId,
                    M01Sistema: sistema,
                    M01Fase: fase,
                    M01Archivo: key.split('/').pop()!,
                    M01Estado: "EN_PROCESO",
                    M01Total: rows.length,
                    M01Correctos: 0,
                    M01Errores: 0,
                }
            });

            // 3) Precargar catálogos

            // Conjunto de préstamos que vienen en el Excel
            const prestamosNumsSet = new Set<string>();
            for (const row of rows) {
                const rawNum = row['Num Prestamo']?.toString() ?? '';
                if (!rawNum) continue;
                const num = rawNum.padStart(8, '0');
                prestamosNumsSet.add(num);
            }
            const prestamosNums = Array.from(prestamosNumsSet);

            const [prestamos, usuarios, elementos] = await this.$transaction([
                // Préstamos existentes de la coop que estén en el Excel
                this.r01Prestamo.findMany({
                    where: {
                        R01Coop_id: cooperativaId,
                        R01NUM: { in: prestamosNums },
                    },
                }),
                this.r12Usuario.findMany({ where: { R12Coop_id: cooperativaId } }),
                this.r04Elemento.findMany({
                    where: {
                        rubro: { grupo: { R02Coop_id: cooperativaId } }
                    }
                })
            ]);

            // ---- Mapas ----

            // Préstamo por número
            const mapaPrestamos = new Map<string, (typeof prestamos)[0]>();
            prestamos.forEach((p) => {
                mapaPrestamos.set(p.R01NUM, p);
            });

            const mapaUsuarios = new Map<string, any>();
            usuarios.forEach(u => mapaUsuarios.set((u.R12Ni ?? "").trim().toUpperCase(), u));

            // const mapaElementos = new Map<string, any>();
            // elementos.forEach(e => mapaElementos.set(e.R04Codigo, e));
            const mapaElementos = new Map<string, (typeof elementos)[0]>();
            elementos.forEach((e) => {
                if (e.R04Codigo) mapaElementos.set(e.R04Codigo, e);
            });

            let correctos = 0;
            let errores = 0;
            const erroresLog: string[] = [];

            // 4) Procesar cada fila (transacción por fila)
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];

                try {
                    await this.$transaction(async (tx) => {

                        // --- Supervisor y ejecutivo ---
                        const supervisorKey = (row["Usuario Supervisor"] ?? "").toString().trim().toUpperCase();
                        const supervisor = mapaUsuarios.get(supervisorKey);
                        if (!supervisor) throw new Error(`Supervisor no encontrado (NI): ${supervisorKey}`);

                        const ejecutivoKey = (row["Usuario Ejvo"] ?? "").toString().trim().toUpperCase();
                        const ejecutivo = mapaUsuarios.get(ejecutivoKey);
                        if (!ejecutivo) throw new Error(`Ejecutivo no encontrado (NI): ${ejecutivoKey}`);

                        // Validar existencia del préstamo    
                        const prestamoNum = row["Num Prestamo"]?.toString().padStart(8, "0");
                        const prestamoInDB = mapaPrestamos.get(prestamoNum);
                        if (!prestamoInDB) {
                            throw new Error(
                                `Préstamo (R01) no encontrado para Num Prestamo: ${prestamoNum}`,
                            );
                        }
                        const prestamoId = prestamoInDB.R01Id

                        // ================================
                        //    A) CREAR Evaluaciones R09
                        // ================================
                        const {
                            evaluacionesData,
                            Ha,
                            Pend,
                            Rc
                        } = this._crearEvaluacionesR09(row, mapaElementos, prestamoId);

                        // Insert bulk
                        if (evaluacionesData.length > 0) {
                            await tx.r09EvaluacionFase3.createMany({ data: evaluacionesData });
                        }

                        // ================================
                        //    B) CREAR Resumen R10
                        // ================================                        
                        const observaciones = row["Observaciones al Desembolso"]

                        const fechaDes = ExcelUtils.parseExcelDate(row['Fecha Revision Desembolso']) ?? '';

                        await this._crearResumenR10(
                            prestamoId,
                            tx,
                            supervisor.R12Id,
                            ejecutivo.R12Id,
                            { Ha, Pend, Rc },
                            observaciones ?? '',
                            fechaDes
                        );

                        // Actualizar a R01Est correspondiente
                        await tx.r01Prestamo.update({
                            where: { R01Id: prestamoId },
                            data: { R01Est: 'Con desembolso' },
                        })
                    });

                    correctos++;

                } catch (error: any) {
                    errores++;
                    const msg = `Fila ${i + 1}: ${error.message}`;
                    erroresLog.push(msg);
                    this._logger.error("❌ " + msg);
                }
            }

            // 5) Actualizar control M01
            await this.m01ControlMigracion.update({
                where: { M01Id: control.M01Id },
                data: {
                    M01Correctos: correctos,
                    M01Errores: errores,
                    M01Estado: errores > 0 ? "COMPLETADO_CON_ERRORES" : "COMPLETADO",
                    M01Log: erroresLog.join("\n"),
                }
            });

            this._logger.log(
                `🏁 Migración F3 Finalizada: Correctos=${correctos}, Errores=${errores}`,
            );

            return {
                success: errores === 0,
                message:
                    errores > 0
                        ? `Migración F3 completada con ${errores} errores.`
                        : 'Migración F3 completada exitosamente.',
                data: {
                    total: rows.length,
                    correctos,
                    errores,
                    controlId: control.M01Id,
                },
            };

        } catch (error: any) {
            this._logger.error(`🔥 Fatal F3: ${error.message}`);
            return { success: false, message: error.message };
        }
    }

    private _crearEvaluacionesR09(
        row: any,
        mapaElementos: Map<string, any>,
        prestamoId: string
    ): {
        evaluacionesData: any[],
        Ha: number,
        Pend: number,
        Rc: number
    } {

        const evaluacionesData: {
            R09P_id: string
            R09E_id: string
            R09Res: any
            R09Ev_en: string
        }[] = [];
        let Ha = 0;
        let Pend = 0;
        let Rc = 0;

        for (const columna in row) {

            const codigo = ExcelRowMapper.obtenerCodigoElementoDesembolso(columna.toUpperCase());
            if (!codigo) continue;

            const elemento = mapaElementos.get(codigo);
            if (!elemento) throw new Error(`Elemento no encontrado por código ${columna}`);

            const valor = (row[columna] ?? "").toString().trim().toUpperCase();
            const resultado = this._mapearResultadoF3(valor);
            const fechaDes = ExcelUtils.parseExcelDate(row['Fecha Revision Desembolso']) ?? ''

            // --- Contadores ---
            if (resultado === "I") {
                Ha++;
            } else if (resultado === "P") {
                Pend++;
            } else if (resultado === "C" || resultado === 'NA') {
                Rc++;
            }

            evaluacionesData.push({
                R09P_id: prestamoId,
                R09E_id: elemento.R04Id,
                R09Res: resultado,
                R09Ev_en: fechaDes,
            });
        }

        return { evaluacionesData, Ha, Pend, Rc };
    }


    private async _crearResumenR10(
        prestamoId: string,
        tx: any,
        supervisorId: string,
        ejecutivoId: string,
        counters: { Ha: number; Pend: number; Rc: number },
        observaciones: string,
        fechaDes: string
    ) {
        const { Ha, Pend, Rc } = counters;

        let calificativo: any = "CORRECTO";
        if (Ha > 0) calificativo = "DEFICIENTE";
        else if (Pend > 0) calificativo = "PENDIENTE";

        return tx.r10EvaluacionResumenFase3.create({
            data: {
                R10P_id: prestamoId,
                R10Ha: Ha,
                R10Pendientes: Pend,
                R10Rc: Rc,
                R10Cal: calificativo,
                R10Obs: observaciones,
                R10FDes: fechaDes,
                R10Ev_por: ejecutivoId,
                R10Sup: supervisorId,
            }
        });
    }

    private _mapearResultadoF3(valor: string) {
        switch (valor) {
            case "P":
                return "C";   // Cumple
            case "O":
                return "I";   // Incorrecto
            case "X":
                return "P";   // Pendiente
            default:
                return "NA";
        }
    }


    // * SISCONCRE F4

    private async _procesarMigracionF4(input: MigracionRequestInput): Promise<BooleanResponse> {
        try {
            const { key, cooperativaId, sistema, fase } = input;

            this._logger.log(`🚀 Iniciando migración F4 → Coop: ${cooperativaId}, Sistema: ${sistema}`);

            // ============================================
            // 1️⃣ Leer Excel
            // ============================================
            const rows = await this.excelService.readExcelAsJsonFromS3(key);
            if (!rows || rows.length === 0) {
                return { success: false, message: 'El archivo de migración está vacío.' };
            }

            // ============================================
            // 2️⃣ Crear control inicial M01
            // ============================================
            const control = await this.m01ControlMigracion.create({
                data: {
                    M01Coop_id: cooperativaId,
                    M01Sistema: sistema,
                    M01Fase: fase,
                    M01Archivo: key.split('/').pop()!,
                    M01Estado: 'EN_PROCESO',
                    M01Total: rows.length,
                    M01Correctos: 0,
                    M01Errores: 0,
                    M01Log: '',
                },
            });

            // Conjunto de préstamos que vienen en el Excel
            const prestamosNumsSet = new Set<string>();
            for (const row of rows) {
                const rawNum = row['Num Prestamo']?.toString() ?? '';
                if (!rawNum) continue;
                const num = rawNum.padStart(8, '0');
                prestamosNumsSet.add(num);
            }
            const prestamosNums = Array.from(prestamosNumsSet);

            // ============================================
            // 3️⃣ Pre-carga de catálogos
            // ============================================
            const [
                prestamos,
                usuarios,
                elementosSeg,    // F1-F2 (hasta CR1)
                elementosDes,    // F3-F4 (CS1 en adelante)
                resumenF1,       // para SegCal
                resumenF3        // para DesCal
            ] = await this.$transaction([
                // Préstamos existentes de la coop que estén en el Excel
                this.r01Prestamo.findMany({
                    where: {
                        R01Coop_id: cooperativaId,
                        R01NUM: { in: prestamosNums },
                    },
                }),
                this.r12Usuario.findMany({ where: { R12Coop_id: cooperativaId } }),
                this.r04Elemento.findMany({
                    where: { rubro: { grupo: { R02Coop_id: cooperativaId, R02Tipo: GrupoTipo.SISCONCRE } } }
                }),
                this.r04Elemento.findMany({
                    where: { rubro: { grupo: { R02Coop_id: cooperativaId, R02Tipo: GrupoTipo.SISCONCRE } } }
                }),
                this.r06EvaluacionResumenFase1.findMany({
                    where: { prestamo: { R01NUM: { in: prestamosNums } } }
                }),
                this.r10EvaluacionResumenFase3.findMany({
                    where: { prestamo: { R01NUM: { in: prestamosNums } } }
                })
            ]);

            // ============================================
            // 4️⃣ Crear mapas para O(1)
            // ============================================
            const mapaPrestamos = new Map<string, (typeof prestamos)[0]>();
            prestamos.forEach((p) => {
                mapaPrestamos.set(p.R01NUM, p);
            });

            const mapaUsuarios = new Map<string, any>();
            usuarios.forEach(u => mapaUsuarios.set(u.R12Ni.toUpperCase(), u));

            const mapaElementosSeg = new Map<string, (typeof elementosSeg)[0]>();
            elementosSeg.forEach((e) => {
                if (e.R04Codigo) mapaElementosSeg.set(e.R04Codigo, e);
            });

            const mapaElementosDes = new Map<string, (typeof elementosDes)[0]>();
            elementosDes.forEach((e) => {
                if (e.R04Codigo) mapaElementosDes.set(e.R04Codigo, e);
            });

            const mapaResumenF1 = new Map<string, any>();
            resumenF1.forEach(r => mapaResumenF1.set(r.R06P_id, r));

            const mapaResumenF3 = new Map<string, any>();
            resumenF3.forEach(r => mapaResumenF3.set(r.R10P_id, r));

            let correctos = 0;
            let errores = 0;
            const erroresLog: string[] = [];

            // ============================================
            // 5️⃣ Procesar filas
            // ============================================
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];

                try {
                    await this.$transaction(async (tx) => {
                        const prestamoNum = row['Num Prestamo']?.toString().padStart(8, '0');
                        const prestamo = mapaPrestamos.get(prestamoNum);
                        if (!prestamo) {
                            throw new Error(
                                `Préstamo (R01) no encontrado para Num Prestamo: ${prestamoNum}`,
                            );
                        }
                        const prestamoId = prestamo.R01Id

                        const supervisorNi = row['Usuario Supervisor']?.toString().trim() ?? '';
                        const supervisor = mapaUsuarios.get(supervisorNi.toUpperCase());
                        if (!supervisor) throw new Error(`Supervisor no encontrado (NI): ${supervisorNi}`);

                        // -------------------------
                        // A) Evaluaciones F1-F2 (seguimiento)
                        // -------------------------
                        const segCounters = await this._procesarEvaluacionesF4Seguimiento(
                            row,
                            prestamoId,
                            tx,
                            supervisor.R12Id,
                            mapaElementosSeg,
                            mapaResumenF1.get(prestamoId)
                        );

                        // -------------------------
                        // B) Evaluaciones F3-F4 (desembolso)
                        // -------------------------
                        const desCounters = await this._procesarEvaluacionesF4Desembolso(
                            row,
                            prestamoId,
                            tx,
                            supervisor.R12Id,
                            mapaElementosDes,
                            mapaResumenF3.get(prestamoId)
                        );

                        // -------------------------
                        // C) Calculo Final
                        // -------------------------
                        const calFinal = this._calcularCalificativoFinal(
                            segCounters.calSeg,
                            desCounters.calDes
                        );

                        // Fecha
                        const fechaSegDes =
                            ExcelUtils.parseExcelDate(row['Fecha Seg a Desembolso']) ?? '';

                        // -------------------------
                        // D) Insertar R16
                        // -------------------------
                        await tx.r16EvaluacionResumenFase4.create({
                            data: {
                                R16P_id: prestamoId,
                                R16SolvT: segCounters.SolvT,
                                R16SolvA: segCounters.SolvA,
                                R16SolvM: segCounters.SolvM,
                                R16SolvB: segCounters.SolvB,
                                R16SegCal: segCounters.calSeg.toUpperCase() as Calificativo,
                                R16HaSolv: desCounters.HaSolv,
                                R16PenCu: desCounters.PenCu,
                                R16RcF: desCounters.RcF,
                                R16DesCal: desCounters.calDes.toUpperCase() as Calificativo,
                                R16CalF: calFinal.toUpperCase() as Calificativo,
                                R16Obs: row['Observaciones Finales'] ?? '',
                                R16FGlo: fechaSegDes,
                                R16Ev_por: supervisor.R12Id,
                            }
                        });

                        // Actualizar a R01Est correspondiente
                        await tx.r01Prestamo.update({
                            where: { R01Id: prestamoId },
                            data: { R01Est: 'Con global' },
                        })

                    }, { timeout: 20_000 });

                    correctos++;
                } catch (error: any) {
                    errores++;
                    const mensaje = `Fila ${i + 1}: ${error?.message}`;
                    erroresLog.push(mensaje);
                    this._logger.error(`❌ ${mensaje}`);
                }
            }

            // ============================================
            // 6️⃣ Actualizar control
            // ============================================
            await this.m01ControlMigracion.update({
                where: { M01Id: control.M01Id },
                data: {
                    M01Correctos: correctos,
                    M01Errores: errores,
                    M01Estado: errores ? 'COMPLETADO_CON_ERRORES' : 'COMPLETADO',
                    M01Log: erroresLog.join('\n'),
                }
            });

            this._logger.log(
                `🏁 Migración F4 Finalizada: Correctos=${correctos}, Errores=${errores}`,
            );

            return {
                success: errores === 0,
                message:
                    errores > 0
                        ? `Migración F3 completada con ${errores} errores.`
                        : 'Migración F3 completada exitosamente.',
                data: {
                    total: rows.length,
                    correctos,
                    errores,
                    controlId: control.M01Id,
                },
            };

        } catch (e: any) {
            return { success: false, message: `Error en migración: ${e.message}` };
        }
    }

    /**
     * Procesa las evaluaciones del bloque SEGUIMIENTO (F1-F2) para F4.
     * Usa el método obtenerCodigoElemento.
     * 
     * Devuelve:
     *  - SolvT, SolvA, SolvM, SolvB, Rc
     *  - calSeg (Correcto | Deficiente)
     */
    private async _procesarEvaluacionesF4Seguimiento(
        row: any,
        prestamoId: string,
        tx: any,
        supervisorId: string,
        mapaElementosSeg: Map<string, any>,
        resumenF1: any,   // R06
    ) {
        const evalsToInsert: {
            R15P_id: string
            R15E_id: string
            R15Res: ResFaseII
        }[] = [];

        let SolvT = 0;
        let SolvA = 0;
        let SolvM = 0;
        let SolvB = 0;
        let Rc = 0;

        const totalHallazgosF1 = resumenF1 ? (resumenF1.R06Ha + resumenF1.R06Hm + resumenF1.R06Hb) : 0;

        for (const columna in row) {

            if (columna.trim() === '|') {
                break; // se detiene seguimiento
            }

            // 1️⃣ Obtener código permanente
            const codigo = ExcelRowMapper.obtenerCodigoElemento(columna.toUpperCase());
            if (!codigo) {
                continue;
            }

            // 2️⃣ Obtener elemento
            const elemento = mapaElementosSeg.get(codigo);
            if (!elemento) throw new Error(`Elemento seguimiento no encontrado: ${columna}`);

            // 3️⃣ Valor Excel → R/S/NS
            const valorExcel = (row[columna] || '').toString().trim().toUpperCase();

            const resultado = this._mapearResultadoF4(valorExcel);

            // 4️⃣ Contar
            if (resultado === 'S') {
                SolvT++;
                Rc++;
                const imp = (elemento.R04Imp || '').toUpperCase();
                if (imp === 'ALTO') SolvA++;
                else if (imp === 'MEDIO') SolvM++;
                else if (imp === 'BAJO') SolvB++;
            } else if (resultado === 'C' || resultado === 'NA') {
                Rc++;
            }

            // 5️⃣ Insertar evaluación
            evalsToInsert.push({
                R15P_id: prestamoId,
                R15E_id: elemento.R04Id,
                R15Res: resultado.toUpperCase() as ResFaseII,
            });
        }

        if (evalsToInsert.length > 0) {
            await tx.r15EvaluacionFase4.createMany({ data: evalsToInsert });
        }

        // 6️⃣ Calificativo SegCal
        const calSeg = this._calcularSegCalificativo(SolvT, totalHallazgosF1);

        return {
            SolvT,
            SolvA,
            SolvM,
            SolvB,
            Rc,
            calSeg,
        };
    }


    /**
     * Procesa el bloque DESEMBOLSO (F3-F4) usando obtenerCodigoElementoDesembolso.
     * 
     * Devuelve:
     *  - HaSolv: Elementos con I en F3 que ahora son S
     *  - PenCu: Elementos con P en F3 que ahora son S
     *  - RcF: Correctos
     *  - calDes (Correcto | Pendiente | Deficiente)
     */
    private async _procesarEvaluacionesF4Desembolso(
        row: any,
        prestamoId: string,
        tx: any,
        supervisorId: string,
        mapaElementosDes: Map<string, any>,
        resumenF3: any   // R10
    ) {
        const evalsToInsert: {
            R15P_id: string
            R15E_id: string
            R15Res: ResFaseII
        }[] = [];

        let HaSolv = 0;
        let PenCu = 0;
        let RcF = 0;
        let PenNS = 0;
        let HaNS = 0;

        // Cargar mapa de evaluaciones previas (F3)
        const prevEval = await tx.r09EvaluacionFase3.findMany({
            where: { R09P_id: prestamoId },
        });

        const mapaPrev = new Map<string, any>();
        prevEval.forEach(e => mapaPrev.set(e.R09E_id, e.R09Res));

        for (const columna in row) {
            const codigo = ExcelRowMapper.obtenerCodigoElementoDesembolso(columna.toUpperCase());
            if (!codigo) continue;

            const elemento = mapaElementosDes.get(codigo);
            if (!elemento) throw new Error(`Elemento desembolso no encontrado: ${columna}`);

            const valorExcel = (row[columna] || '').toString().trim().toUpperCase();
            const resultado = this._mapearResultadoF4(valorExcel);

            // ANÁLISIS CONTRA F3
            const prevRes = mapaPrev.get(elemento.R04Id);

            if (prevRes === 'I' && resultado === 'S') {
                HaSolv++;
                RcF++;
            }
            if (prevRes === 'P' && resultado === 'S') {
                PenCu++;
                RcF++;
            }
            if (resultado === 'C' || resultado === 'NA') RcF++;

            if (prevRes === 'P' && resultado === 'NS') {
                PenNS++;
            }

            if (prevRes === 'I' && resultado === 'NS') {
                HaNS++;
            }

            evalsToInsert.push({
                R15P_id: prestamoId,
                R15E_id: elemento.R04Id,
                R15Res: resultado.toUpperCase() as ResFaseII,
            });
        }

        if (evalsToInsert.length > 0) {
            await tx.r15EvaluacionFase4.createMany({ data: evalsToInsert });
        }

        // Calcular calificativo de desembolso
        const calDes = this._calcularDesCalificativo(PenNS, HaNS, RcF);

        return {
            HaSolv,
            PenCu,
            RcF,
            calDes,
        };
    }

    private _mapearResultadoF4(valor: string) {
        switch (valor) {
            case "P":
                return "C";   // Cumple
            // case "O":
            //     return "I";   // Incorrecto
            // case "X":
            //     return "P";   // Pendiente
            case "R":
                return "S";   // Solventado
            case "T":
                return "NS";   // No Solventado
            case "W":
                return "NA";   // No Solventado
            default:
                return "I";
        }
    }

    private _calcularSegCalificativo(SolvT: number, totalHallazgosF1: number): string {
        if (totalHallazgosF1 === 0) return 'CORRECTO';

        return SolvT === totalHallazgosF1
            ? 'CORRECTO'
            : 'DEFICIENTE';
    }

    private _calcularDesCalificativo(PenNS: number, HaNS: number, RcF: number): string {
        if (HaNS > 0) return 'DEFICIENTE';

        if (PenNS > 0) return 'PENDIENTE';

        // Si no hubo solventados pero solo hubo correctos
        // if (RcF > 0) return 'CORRECTO';

        return 'CORRECTO';
    }

    private _calcularCalificativoFinal(calSeg: string, calDes: string): string {
        if (calSeg === 'CORRECTO' && calDes === 'CORRECTO') return 'CORRECTO';

        if (calSeg === 'CORRECTO' && calDes === 'PENDIENTE') return 'PENDIENTE';

        return 'DEFICIENTE';
    }

    //* =========================
    // * SISCONCAP
    //* =========================
    /**
     // * 🔹 MIGRACIÓN F1
     R19Movimientos + R20EvaluacionFase1Sisconcap + R21ResumenF1
     *
     * Flujo:
     * 1) Lee el Excel desde S3
     * 2) Crea control M01 en estado EN_PROCESO
     * 3) Precarga catálogos (sucursales, usuarios, elementos SisConCap)
     * 4) Recorre filas:
     *    - Crea R19Movimientos
     *    - Busca supervisor/ejecutivo por NI
     *    - Crea R20EvaluacionFase1Sisconcap (createMany)
     *    - Crea R21EvaluacionResumenFase1 (en memoria)
     * 5) Actualiza M01 con Correctos/Errores/Log
     */
    public async _procesarMigracionSisconcapF1(
        input: MigracionRequestInput,
    ): Promise<BooleanResponse> {
        try {
            const { key, cooperativaId, sistema, fase } = input;

            this._logger.log(
                `🚀 Iniciando migración F1 SISCONCAP → Coop: ${cooperativaId}, Archivo: ${key}`,
            );

            // 1️⃣ Leer Excel desde S3
            const rows = await this.excelService.readExcelAsJsonFromS3(key);

            if (!rows || rows.length === 0) {
                return {
                    success: false,
                    message: 'El archivo de migración está vacío.',
                };
            }

            // 2️⃣ Crear control inicial M01
            const control = await this.m01ControlMigracion.create({
                data: {
                    M01Coop_id: cooperativaId,
                    M01Sistema: sistema,
                    M01Fase: fase,
                    M01Archivo: key.split('/').pop()!,
                    M01Estado: 'EN_PROCESO',
                    M01Total: rows.length,
                    M01Correctos: 0,
                    M01Errores: 0,
                    M01Log: '',
                },
            });

            // 3️⃣ Precargar catálogos
            const [sucursales, usuarios, elementosSisconcap] = await this.$transaction([
                this.r11Sucursal.findMany({
                    where: { R11Coop_id: cooperativaId },
                }),
                this.r12Usuario.findMany({
                    where: { R12Coop_id: cooperativaId },
                }),
                this.r04Elemento.findMany({
                    where: {
                        rubro: {
                            grupo: {
                                R02Coop_id: cooperativaId,
                                R02Tipo: GrupoTipo.SISCONCAP
                            },
                        },
                    },
                }),
            ]);

            // 4️⃣ Construir mapas para lookups O(1)

            // sucursalNum (ej. "01") → sucursal
            const mapaSucursales = new Map<string, (typeof sucursales)[0]>();
            sucursales.forEach((s) => {
                const key = (s.R11NumSuc ?? '').toString().trim().toUpperCase();
                if (key) mapaSucursales.set(key, s);
            });

            // NI usuario → usuario
            const mapaUsuarios = new Map<string, (typeof usuarios)[0]>();
            usuarios.forEach((u) => {
                const key = (u.R12Ni ?? '').toString().trim().toUpperCase();
                if (key) mapaUsuarios.set(key, u);
            });

            // código elemento SisConCap → elemento
            const mapaElementosSisconcap = new Map<string, (typeof elementosSisconcap)[0]>();
            elementosSisconcap.forEach((e) => {
                if (e.R04Codigo) {
                    mapaElementosSisconcap.set(e.R04Codigo, e);
                }
            });

            let correctos = 0;
            let errores = 0;
            const erroresLog: string[] = [];

            // 5️⃣ Procesar fila por fila (transacción por fila)
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];

                try {
                    await this.$transaction(
                        async (tx) => {
                            // a) Crear movimiento (R19)
                            const movimiento = await this.crearMovimientoDesdeExcelSisconcap(
                                row,
                                cooperativaId,
                                tx,
                                { mapaSucursales },
                            );

                            const folio = movimiento.R19Folio;

                            // b) Buscar Supervisor y Ejecutivo por NI
                            const supervisorNi = row['Clave Supervisor']?.toString().trim() ?? '';
                            const ejecutivoNi = row['Clave Usuario']?.toString().trim() ?? '';

                            const supervisor = mapaUsuarios.get(supervisorNi.toUpperCase());
                            if (!supervisor) {
                                throw new Error(`Supervisor no encontrado (NI): ${supervisorNi}`);
                            }

                            const ejecutivo = mapaUsuarios.get(ejecutivoNi.toUpperCase());
                            if (!ejecutivo) {
                                throw new Error(`Ejecutivo no encontrado (NI): ${ejecutivoNi}`);
                            }

                            // c) Crear evaluaciones R20 y obtener Ha/Rc
                            const { Ha, Rc } = await this.crearEvaluacionesR20F1Sisconcap(
                                row,
                                folio,
                                tx,
                                mapaElementosSisconcap,
                            );

                            // d) Crear resumen R21
                            await this.crearResumenR21SisconcapF1(
                                folio,
                                tx,
                                { Ha, Rc },
                                supervisor.R12Id,
                                ejecutivo.R12Id,
                            );
                        },
                        { timeout: 20_000 },
                    );

                    correctos++;
                } catch (error: any) {
                    errores++;
                    const mensaje = `Fila ${i + 1}: ${error?.message || error}`;
                    erroresLog.push(mensaje);
                    this._logger.error(`❌ Error fila SisConCap F1 → ${mensaje}`);
                }
            }

            // 6️⃣ Actualizar control M01
            await this.m01ControlMigracion.update({
                where: { M01Id: control.M01Id },
                data: {
                    M01Correctos: correctos,
                    M01Errores: errores,
                    M01Estado: errores > 0 ? 'COMPLETADO_CON_ERRORES' : 'COMPLETADO',
                    M01Log: erroresLog.join('\n'),
                },
            });

            this._logger.log(
                `🏁 Migración F1 SISCONCAP finalizada: Correctos=${correctos}, Errores=${errores}`,
            );

            return {
                success: errores === 0,
                message:
                    errores > 0
                        ? `Migración F1 SisConCap completada con ${errores} errores.`
                        : 'Migración F1 SisConCap completada exitosamente.',
                data: {
                    total: rows.length,
                    correctos,
                    errores,
                    controlId: control.M01Id,
                },
            };
        } catch (error: any) {
            this._logger.error(`🔥 Error fatal en migración F1 SisConCap: ${error.message}`);

            return {
                success: false,
                message: `Error en migración F1 SisConCap: ${error.message}`,
            };
        }
    }


    private async crearMovimientoDesdeExcelSisconcap(
        row: any,
        cooperativaId: string,
        tx: any,
        maps: {
            mapaSucursales: Map<string, any>;
        }
    ) {
        const { mapaSucursales } = maps;

        // 1) Sucursal
        const sucursalNum = row['Sucursal']?.toString().trim() ?? '';
        const sucursalKey = sucursalNum.toUpperCase();
        const sucursal = mapaSucursales.get(sucursalKey);
        if (!sucursal) {
            throw new Error(`Sucursal no encontrada: ${sucursalNum}`);
        }

        // 2) Datos generales del movimiento
        const cag = row['Cag']?.toString().trim() ?? '';
        const nombre = row['Nombre']?.toString().trim() ?? '';
        const figura = (row['Figura'] ?? '').toString().trim().toUpperCase();
        const tipoMov = (row['Tipo Movimiento'] ?? '').toString().trim().toUpperCase();

        const fMov = ExcelUtils.parseExcelDate(row['Fecha Movimiento']) ?? '';
        const fRec = ExcelUtils.parseExcelDate(row['Fecha Recepcion']) ?? '';
        const fRev = ExcelUtils.parseExcelDate(row['Fecha Revision']) ?? '';

        // 3) Crear R19Movimientos
        const movimiento = await tx.r19Movimientos.create({
            data: {
                R19Cag: cag,
                R19Nom: nombre,
                R19Figura: figura as Figura,
                R19Suc_id: sucursal.R11Id,
                R19TipoMov: tipoMov as Movimiento,   // Enum Movimiento
                R19FMov: fMov,
                R19FRec: fRec,
                R19FRev: fRev,
                R19Est: 'Sin seguimiento',
                R19Coop_id: cooperativaId,
            },
        });

        return movimiento;
    }

    /**
     * Crea las evaluaciones R20EvaluacionFase1Sisconcap para un movimiento.
     *
     * - Usa los códigos de elementos específicos de SisConCap
     *   via ExcelRowMapper.obtenerCodigoElementoSisconcap
     * - Cuenta:
     *   * Ha: total de "I" (hallazgos) en Fase 1 (no hay Hm/Hb aquí)
     *   * Rc: total de "C" (correctos)
     */
    private async crearEvaluacionesR20F1Sisconcap(
        row: any,
        folio: number,
        tx: any,
        mapaElementosSisconcap: Map<string, any>,
    ): Promise<{ Ha: number; Rc: number }> {
        const evaluacionesData: {
            R20Folio: number;
            R20E_id: string;
            R20Res: any;
        }[] = [];

        let Ha = 0;
        let Rc = 0;

        for (const columna in row) {
            // 1) Obtener código permanente de elemento (map SisConCap)
            const codigo = ExcelRowMapper.obtenerCodigoElementoSisconcap(columna.toUpperCase());
            if (!codigo) continue

            // 2) Localizar elemento
            const elemento = mapaElementosSisconcap.get(codigo);
            if (!elemento) {
                throw new Error(`Elemento SisConCap no encontrado para columna: ${columna}`);
            }

            // 3) Valor Excel → P / O / W → C / I / NA
            const valorExcel = (row[columna] || '').toString().trim().toUpperCase();
            const resultado = this._mapearResultadoF1(valorExcel); // Reusamos el de crédito: P→C, O→I, otro→NA

            // 4) Contar Ha, Rc
            if (resultado === 'I') {
                Ha++;
            } else if (resultado === 'C' || resultado === 'NA') {
                Rc++;
            }

            // 5) Acumular para createMany
            evaluacionesData.push({
                R20Folio: folio,
                R20E_id: elemento.R04Id,
                R20Res: resultado,
            });
        }

        if (evaluacionesData.length > 0) {
            await tx.r20EvaluacionFase1Sisconcap.createMany({
                data: evaluacionesData,
            });
        }

        return { Ha, Rc };
    }

    /**
     * Crea el resumen R21EvaluacionResumenFase1 para SisConCap.
     *
     * Regla sugerida:
     *  - Ha > 0 → DEFICIENTE
     *  - Ha = 0 → CORRECTO
     */
    private async crearResumenR21SisconcapF1(
        folio: number,
        tx: any,
        counters: { Ha: number; Rc: number },
        supervisorId: string,
        ejecutivoId: string,
    ) {
        const { Ha, Rc } = counters;

        const cal = this._obtenerCalificativoSisconcapF1(Ha);

        return tx.r21EvaluacionResumenFase1.create({
            data: {
                R21Folio: folio,
                R21Ha: Ha,
                R21Rc: Rc,
                R21Cal: cal,
                R21Obs: '',
                R21SP_id: supervisorId,
                R21Ejvo_id: ejecutivoId,
            },
        });
    }

    /**
     * Calificativo F1 SisConCap:
     *  - Si hay al menos un hallazgo (Ha > 0) → DEFICIENTE
     *  - Sin hallazgos → CORRECTO
     * (Si luego quieres ACEPTABLE u otro criterio, solo ajustas aquí.)
     */
    private _obtenerCalificativoSisconcapF1(Ha: number) {
        if (Ha > 0) return 'DEFICIENTE';
        return 'CORRECTO';
    }


    // * =======================
    // * 🔹 MIGRACIÓN F2
    // * =======================

    private async _procesarMigracionSisconcapF2(input: MigracionRequestInput): Promise<BooleanResponse> {
        const { key, cooperativaId, sistema, fase } = input;

        this._logger.log(
            `🚀 Iniciando migración F2 SisConCap → Coop: ${cooperativaId}, Archivo: ${key}`,
        );

        // 1. Leer Excel
        const rows = await this.excelService.readExcelAsJsonFromS3(key);

        if (!rows || rows.length === 0) {
            return {
                success: false,
                message: 'El archivo de migración F2 SisConCap está vacío.',
            };
        }

        // 2. Crear control M01
        const control = await this.m01ControlMigracion.create({
            data: {
                M01Coop_id: cooperativaId,
                M01Sistema: sistema,
                M01Fase: fase,
                M01Archivo: key.split('/').pop()!,
                M01Estado: 'EN_PROCESO',
                M01Total: rows.length,
                M01Correctos: 0,
                M01Errores: 0,
                M01Log: '',
            },
        });

        // 3. Precargar catálogos y datos base
        const [
            sucursales,
            usuarios,
            elementosSisconcap,
            movimientos,
            resumenesF1,
        ] = await this.$transaction([
            // Sucursales por cooperativa
            this.r11Sucursal.findMany({
                where: { R11Coop_id: cooperativaId },
            }),
            // Usuarios (ejecutivos / supervisores)
            this.r12Usuario.findMany({
                where: { R12Coop_id: cooperativaId },
            }),
            // Elementos de SisConCap
            this.r04Elemento.findMany({
                where: {
                    rubro: {
                        grupo: {
                            R02Coop_id: cooperativaId,
                            R02Tipo: GrupoTipo.SISCONCAP
                        },
                    },
                },
            }),
            // Movimientos ya creados en F1
            this.r19Movimientos.findMany({
                where: { R19Coop_id: cooperativaId },
            }),
            // Resúmenes de F1 (para obtener R21Ha)
            this.r21EvaluacionResumenFase1.findMany({
                where: {
                    movimiento: {
                        R19Coop_id: cooperativaId,
                    },
                },
            }),
        ]);

        // 4. Construir mapas

        // sucursalNum (ej. "0", "2") → sucursal
        const mapaSucursales = new Map<string, (typeof sucursales)[0]>();
        sucursales.forEach((s) => {
            const key = (s.R11NumSuc ?? '').toString().trim().toUpperCase();
            if (key) mapaSucursales.set(key, s);
        });

        // NI usuario → usuario
        const mapaUsuarios = new Map<string, (typeof usuarios)[0]>();
        usuarios.forEach((u) => {
            const key = (u.R12Ni ?? '').toString().trim().toUpperCase();
            if (key) mapaUsuarios.set(key, u);
        });

        // código de elemento (R04Codigo) → elemento
        const mapaElementosSisconcap = new Map<string, (typeof elementosSisconcap)[0]>();
        elementosSisconcap.forEach((e) => {
            if (e.R04Codigo) mapaElementosSisconcap.set(e.R04Codigo, e);
        });

        // folio → resumen F1
        const mapaResumenF1 = new Map<number, (typeof resumenesF1)[0]>();
        resumenesF1.forEach((r) => {
            mapaResumenF1.set(r.R21Folio, r);
        });

        // (CAG + sucursalId + FMov) → movimiento
        const mapaMovimientos = new Map<string, (typeof movimientos)[0]>();
        movimientos.forEach((m) => {
            const key = this._claveMovimientoComposite(
                m.R19Cag,
                m.R19Suc_id,
                m.R19FMov,
            );
            mapaMovimientos.set(key, m);
        });

        let correctos = 0;
        let errores = 0;
        const erroresLog: string[] = [];

        // 5. Procesar filas
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];

            try {
                await this.$transaction(
                    async (tx) => {
                        // 5.1 Localizar sucursal
                        const sucursalNum = row['Sucursal']?.toString().trim() ?? '';
                        const suc = mapaSucursales.get(sucursalNum.toUpperCase());
                        if (!suc) {
                            throw new Error(`Sucursal no encontrada: ${sucursalNum}`);
                        }

                        // 5.2 CAG
                        const cag =
                            row['Cag']?.toString().trim() ??
                            row['CAG']?.toString().trim() ??
                            '';
                        if (!cag) {
                            throw new Error('CAG vacío en la fila');
                        }

                        // 5.3 Fecha Movimiento (MISMA lógica que en F1)
                        const fMov =
                            ExcelUtils.parseExcelDate(row['Fecha Movimiento']) ?? '';
                        if (!fMov) {
                            throw new Error('Fecha Movimiento vacía o inválida');
                        }

                        // 5.4 Buscar movimiento F1 por clave compuesta
                        const claveMov = this._claveMovimientoComposite(
                            cag,
                            suc.R11Id,
                            fMov,
                        );

                        const movimiento = mapaMovimientos.get(claveMov);
                        if (!movimiento) {
                            throw new Error(
                                `Movimiento F1 no encontrado para CAG=${cag}, Sucursal=${sucursalNum}, FMov=${fMov}`,
                            );
                        }

                        const folio = movimiento.R19Folio;

                        // 5.5 Resumen F1 (para R21Ha)
                        const resumenF1 = mapaResumenF1.get(folio);
                        const totalHaF1 = resumenF1 ? resumenF1.R21Ha : 0;

                        // 5.6 Supervisor por NI
                        const supervisorNi =
                            row['Clave Supervisor']?.toString().trim() ?? '';
                        const supervisor = mapaUsuarios.get(
                            supervisorNi.toUpperCase(),
                        );
                        if (!supervisor) {
                            throw new Error(
                                `Supervisor no encontrado (NI): ${supervisorNi}`,
                            );
                        }

                        // 5.7 Crear evaluaciones F2 (R22) y obtener conteos
                        const { Solv, Rc } = await this._crearEvaluacionesR22Sisconcap(
                            row,
                            folio,
                            tx,
                            mapaElementosSisconcap,
                        );

                        // 5.8 Calcular PSolv y Calificativo
                        const Psolv = Math.max(totalHaF1 - Solv, 0);
                        const cal = this._calcularCalificativoF2Sisconcap(
                            Solv,
                            totalHaF1,
                        );

                        // 5.9 Fecha de Seguimiento (ajusta el nombre de columna si es distinto)
                        const fechaSeg =
                            ExcelUtils.parseExcelDate(row['Fecha Seguimiento']) ?? '';
                        const observaciones = row['Observaciones Seg'] ?? ''

                        // 5.10 Crear resumen R23
                        await this._crearResumenR23Sisconcap(
                            folio,
                            tx,
                            supervisor.R12Id,
                            {
                                Solv,
                                Psolv,
                                Rc,
                                cal,
                                fechaSeg,
                                observaciones,
                            },
                        );

                        // Actualizar a R19Est correspondiente
                        await tx.r19Movimientos.update({
                            where: { R19Folio: folio },
                            data: { R19Est: 'Con seguimiento' },
                        })

                    },
                    { timeout: 20_000 },
                );

                correctos++;
            } catch (error: any) {
                errores++;
                const mensaje = `Fila ${i + 1}: ${error?.message || error}`;
                erroresLog.push(mensaje);
                this._logger.error(`❌ Error fila ${mensaje}`);
            }
        }

        // 6. Actualizar control M01
        await this.m01ControlMigracion.update({
            where: { M01Id: control.M01Id },
            data: {
                M01Correctos: correctos,
                M01Errores: errores,
                M01Estado: errores > 0 ? 'COMPLETADO_CON_ERRORES' : 'COMPLETADO',
                M01Log: erroresLog.join('\n'),
            },
        });

        this._logger.log(
            `🏁 Migración F2 SisConCap Finalizada: Correctos=${correctos}, Errores=${errores}`,
        );

        return {
            success: errores === 0,
            message:
                errores > 0
                    ? `Migración F2 SisConCap completada con ${errores} errores.`
                    : 'Migración F2 SisConCap completada exitosamente.',
            data: {
                total: rows.length,
                correctos,
                errores,
                controlId: control.M01Id,
            },
        };
    }

    /**
     * Construye la clave única del movimiento:
     *  CAG + SucursalId + FechaMovimiento
     */
    private _claveMovimientoComposite(
        cag: string,
        sucursalId: string,
        fechaMov: string,
    ): string {
        const c = (cag ?? '').toString().trim().toUpperCase();
        const s = (sucursalId ?? '').toString().trim().toUpperCase();
        const f = (fechaMov ?? '').toString().trim();

        return `${c}_${s}_${f}`;
    }

    private async _crearEvaluacionesR22Sisconcap(
        row: any,
        folio: number,
        tx: any,
        mapaElementosSisconcap: Map<string, any>,
    ): Promise<{ Solv: number; Rc: number }> {
        const evaluacionesData: {
            R22Folio: number;
            R22E_id: string;
            R22Res: any;
        }[] = [];

        let Solv = 0;
        let Rc = 0;

        for (const columna in row) {
            // Mapear nombre de columna a código de elemento SisConCap
            const codigo = ExcelRowMapper.obtenerCodigoElementoSisconcap(
                columna.toUpperCase(),
            );
            if (!codigo) continue;

            const elemento = mapaElementosSisconcap.get(codigo);
            if (!elemento) {
                throw new Error(
                    `Elemento SisConCap no encontrado para columna: ${columna}`,
                );
            }

            const valorExcel = (row[columna] || '')
                .toString()
                .trim()
                .toUpperCase();

            // Usa el MISMO mapeo de F2 SisConCre
            const resultado = this._mapearResultadoF2(valorExcel);

            if (resultado === 'S') {
                Solv++;
                Rc++;
            }
            if (resultado === 'C' || resultado === 'NA') Rc++;

            evaluacionesData.push({
                R22Folio: folio,
                R22E_id: elemento.R04Id,
                R22Res: resultado,
            });
        }

        if (evaluacionesData.length > 0) {
            await tx.r22EvaluacionFase2Sisconcap.createMany({
                data: evaluacionesData,
            });
        }

        return { Solv, Rc };
    }

    private async _crearResumenR23Sisconcap(
        folio: number,
        tx: any,
        supervisorId: string,
        data: {
            Solv: number;
            Psolv: number;
            Rc: number;
            cal: any;
            fechaSeg: string;
            observaciones: string;
        },
    ) {
        const { Solv, Psolv, Rc, cal, fechaSeg, observaciones } = data;

        return tx.r23EvaluacionResumenFase2.create({
            data: {
                R23Folio: folio,
                R23Solv: Solv,
                R23PSolv: Psolv,
                R23Rc: Rc,
                R23Obs: observaciones,
                R23Cal: cal,
                R23FSeg: fechaSeg,
                R23SP_id: supervisorId,
            },
        });
    }

    /**
     * Calificativo F2 SisConCap:
     *  - Si R23Solv === R21Ha → CORRECTO
     *  - En otro caso → DEFICIENTE
     */
    private _calcularCalificativoF2Sisconcap(
        solv: number,
        totalHaF1: number,
    ): string {
        if (solv >= totalHaF1) return 'CORRECTO';
        return 'DEFICIENTE';
    }

    // * =======================
    // * 🔹 MIGRACIÓN F3
    // * =======================

    // ================================================================
    // 🟦 MIGRACIÓN F3 - SISCONCAP
    // ================================================================
    private async _procesarMigracionSisconcapF3(input: MigracionRequestInput): Promise<BooleanResponse> {

        const { key, cooperativaId, sistema, fase } = input;

        this._logger.log(
            `🚀 Iniciando migración F3 SisConCap → Coop: ${cooperativaId}, Archivo: ${key}`,
        );

        // 1️⃣ Leer Excel
        const rows = await this.excelService.readExcelAsJsonFromS3(key);
        if (!rows?.length) {
            return { success: false, message: 'El archivo de migración F3 SisConCap está vacío.', };
        }

        // 2. Crear control M01
        const control = await this.m01ControlMigracion.create({
            data: {
                M01Coop_id: cooperativaId,
                M01Sistema: sistema,
                M01Fase: fase,
                M01Archivo: key.split('/').pop()!,
                M01Estado: 'EN_PROCESO',
                M01Total: rows.length,
                M01Correctos: 0,
                M01Errores: 0,
                M01Log: '',
            },
        });

        // 3 Precargar catálogos necesarios
        const [
            movimientosF1,
            sucursales,
            elementosF3,
            resF2,
            usuarios
        ] = await this.$transaction([
            this.r19Movimientos.findMany({ where: { R19Coop_id: cooperativaId } }),

            this.r11Sucursal.findMany({ where: { R11Coop_id: cooperativaId } }),

            this.r04Elemento.findMany({
                where: {
                    rubro: { grupo: { R02Coop_id: cooperativaId, R02Tipo: GrupoTipo.SISCONCAP } }
                }
            }),

            this.r23EvaluacionResumenFase2.findMany({
                where: {
                    movimiento: {
                        R19Coop_id: cooperativaId,
                    },
                },
            }),

            this.r12Usuario.findMany({
                where: { R12Coop_id: cooperativaId }
            }),
        ]);

        // 4 Mapas
        const mapaSuc = new Map<string, (typeof sucursales)[0]>();
        sucursales.forEach((s) => {
            const key = (s.R11NumSuc ?? '').toString().trim().toUpperCase();
            if (key) mapaSuc.set(key, s);
        });

        const mapaUsuarios = new Map<string, (typeof usuarios)[0]>();
        usuarios.forEach((u) => {
            const key = (u.R12Ni ?? '').toString().trim().toUpperCase();
            if (key) mapaUsuarios.set(key, u);
        });

        // Elementos
        const mapaElementos = new Map<string, (typeof elementosF3)[0]>();
        elementosF3.forEach((e) => {
            if (e.R04Codigo) mapaElementos.set(e.R04Codigo, e);
        });

        // Movimientos (clave compuesta)
        const mapaMovimientos = new Map<string, (typeof movimientosF1)[0]>();
        movimientosF1.forEach((m) => {
            const key = this._claveMovimientoComposite(
                m.R19Cag,
                m.R19Suc_id,
                m.R19FMov,
            );
            mapaMovimientos.set(key, m);
        });

        // Resúmenes F2 (para R23PSolv)
        const mapaResF2 = new Map<number, (typeof resF2)[0]>();
        resF2.forEach((r) => {
            mapaResF2.set(r.R23Folio, r);
        });


        let correctos = 0;
        let errores = 0;
        const erroresLog: string[] = [];

        // 4️⃣ Recorrer filas
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];

            try {
                await this.$transaction(async tx => {

                    // Buscar sucursal
                    const sucursalNum = row['Sucursal']?.toString().trim() ?? '';
                    const suc = mapaSuc.get(sucursalNum.toUpperCase());
                    if (!suc) {
                        throw new Error(`Sucursal no encontrada: ${sucursalNum}`);
                    }

                    const cag =
                        row['Cag']?.toString().trim() ??
                        row['CAG']?.toString().trim() ??
                        '';
                    if (!cag) {
                        throw new Error('CAG vacío en la fila');
                    }

                    const fMov =
                        ExcelUtils.parseExcelDate(row['Fecha Movimiento']) ?? '';
                    if (!fMov) {
                        throw new Error('Fecha Movimiento vacía o inválida');
                    }

                    // Clave compuesta para encontrar movimiento existente
                    const clave = this._claveMovimientoComposite(
                        cag,
                        suc.R11Id,
                        fMov,
                    );

                    const movimiento = mapaMovimientos.get(clave);
                    if (!movimiento) {
                        throw new Error(
                            `   Movimiento F1 no encontrado para CAG=${cag}, Sucursal=${suc}, FMov=${fMov}`,
                        );
                    }

                    const resumenF2 = mapaResF2.get(movimiento.R19Folio);
                    if (!resumenF2) throw new Error(`No existe resumen F2 para el folio ${movimiento.R19Folio}`);

                    // Supervisor
                    const supervisorNi = row['Clave Supervisor']?.toString().trim() ?? '';
                    const supervisor = mapaUsuarios.get(
                        supervisorNi.toUpperCase(),
                    );
                    if (!supervisor) {
                        throw new Error(
                            `Supervisor no encontrado (NI): ${supervisorNi}`,
                        );
                    }

                    // 5️⃣ Evaluaciones F3
                    const { Solv, Rc } = await this._procesarEvaluacionesF3(
                        row,
                        movimiento.R19Folio,
                        tx,
                        mapaElementos
                    );

                    // 6️⃣ Resumen F3
                    // const PSolv = resumenF2.R23PSolv - Solv;
                    const PSolvF2 = resumenF2.R23PSolv
                    let PSolv = 0
                    if (PSolvF2 > 0) {
                        PSolv = resumenF2.R23PSolv - Solv;
                    }

                    const cal = Solv >= resumenF2.R23PSolv ? "CORRECTO" : "DEFICIENTE";

                    const observaciones = row['Observaciones Final'] ?? ''

                    await tx.r25EvaluacionResumenFase3.create({
                        data: {
                            R25Folio: movimiento.R19Folio,
                            R25Solv: Solv,
                            R25PSolv: PSolv,
                            R25Rc: Rc,
                            R25Obs: observaciones,
                            R25Cal: cal,
                            R25FSegG: ExcelUtils.parseExcelDate(row["Fecha De Seguimiento Final"]) ?? '',
                            R25SP_id: supervisor.R12Id
                        }
                    });

                    // Actualizar a R19Est correspondiente
                    await tx.r19Movimientos.update({
                        where: { R19Folio: movimiento.R19Folio },
                        data: { R19Est: 'Con global' },
                    })

                },
                    { timeout: 20_000 },
                );

                correctos++;

            } catch (error: any) {
                errores++;
                const mensaje = `Fila ${i + 1}: ${error?.message || error}`;
                erroresLog.push(mensaje);
                this._logger.error(`❌ Error fila ${mensaje}`);
            }
        }

        await this.m01ControlMigracion.update({
            where: { M01Id: control.M01Id },
            data: {
                M01Correctos: correctos,
                M01Errores: errores,
                M01Estado: errores > 0 ? 'COMPLETADO_CON_ERRORES' : 'COMPLETADO',
                M01Log: erroresLog.join('\n'),
            },
        });

        this._logger.log(
            `🏁 Migración F3 SisConCap Finalizada: Correctos=${correctos}, Errores=${errores}`,
        );

        return {
            success: errores === 0,
            message:
                errores > 0
                    ? `Migración F3 SisConCap completada con ${errores} errores.`
                    : 'Migración F3 SisConCap completada exitosamente.',
            data: {
                total: rows.length,
                correctos,
                errores,
                controlId: control.M01Id,
            },
        };
    }


    private async _procesarEvaluacionesF3(
        row: any,
        folio: number,
        tx: any,
        mapaElementos: Map<string, any>
    ): Promise<{ Solv: number; Rc: number }> {

        const evals: {
            R24Folio: number
            R24E_id: string
            R24Res: any
        }[] = [];

        let Solv = 0;
        let Rc = 0;

        for (const columna in row) {
            const codigo = ExcelRowMapper.obtenerCodigoElementoSisconcap(columna);
            if (!codigo) continue;

            const elemento = mapaElementos.get(codigo);
            if (!elemento) {
                throw new Error(`Elemento F3 no encontrado: ${columna}`);
            }

            const valor = (row[columna] || "").toString().trim().toUpperCase();
            const res = this._mapearResultadoF2(valor);

            if (res === "S") {
                Solv++;
                Rc++
            }
            if (res === "C" || res === 'NA') Rc++;

            evals.push({
                R24Folio: folio,
                R24E_id: elemento.R04Id,
                R24Res: res
            });
        }

        if (evals.length > 0) {
            await tx.r24EvaluacionFase3Sisconcap.createMany({ data: evals });
        }

        return { Solv, Rc };
    }


}
