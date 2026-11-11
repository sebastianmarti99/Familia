const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();
app.use(cors()); // Permite peticiones desde el navegador
app.use(express.json());

// Configuración de tu conexión a SQL Server
const dbConfig = {
    user: 'stroopuser',
    password: 'Stroop123!',
    server: 'localhost',
    port: 1433,
    database: 'EvaluacionesCognitivas',
    options: {
        trustServerCertificate: true
    }
};

// Endpoint que recibe los datos desde el Test de Stroop
app.post('/api/stroop', async (req, res) => {
    try {
        const data = req.body;
        let pool = await sql.connect(dbConfig);
        
        await pool.request()
            .input('RutSeudonimo', sql.VarChar(50), data.participantId)
            .input('TotalAciertos', sql.Int, data.totalCorrect)
            .input('TotalEnsayos', sql.Int, data.totalTrials || 60)
            .input('PrecisionPorcentaje', sql.Decimal(5, 2), data.accuracyPct)
            .input('TRCongruenteMS', sql.Int, data.trCong)
            .input('TRIncongruenteMS', sql.Int, data.trIncong)
            .input('TRNeutroMS', sql.Int, data.trNeutral)
            .input('InterferenciaStroopMS', sql.Int, data.interference)
            .input('DetalleEnsayosJSON', sql.NVarChar(sql.MAX), JSON.stringify(data.trials))
            .input('FechaRegistro', sql.DateTime, new Date())
            .query(`
                INSERT INTO ResultadosStroop 
                (RutSeudonimo, TotalAciertos, TotalEnsayos, PrecisionPorcentaje, TRCongruenteMS, TRIncongruenteMS, TRNeutroMS, InterferenciaStroopMS, DetalleEnsayosJSON, FechaRegistro)
                VALUES 
                (@RutSeudonimo, @TotalAciertos, @TotalEnsayos, @PrecisionPorcentaje, @TRCongruenteMS, @TRIncongruenteMS, @TRNeutroMS, @InterferenciaStroopMS, @DetalleEnsayosJSON, @FechaRegistro)
            `);

        console.log(`✅ Resultado guardado en SQL Server para: ${data.participantId}`);
        res.status(200).json({ success: true, message: 'Guardado correctamente en SQL Server' });
    } catch (err) {
        console.error('❌ Error guardando en SQL Server:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.listen(3000, () => {
    console.log('🚀 Servidor API de Stroop escuchando en http://localhost:3000');
});