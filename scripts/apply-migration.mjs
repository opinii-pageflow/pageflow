import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = 'https://fdihrngybdmppuomjgcn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkaWhybmd5YmRtcHB1b21qZ2NuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwODAwMTAsImV4cCI6MjA4NjY1NjAxMH0.-GyuDAHkIsEmPBVPNb3qwMKPSIBa2C8elSgrSBOfBN8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
    console.log('🚀 Aplicando migration no Supabase...\n');

    try {
        // Ler arquivo de migration
        const migrationPath = join(process.cwd(), 'supabase', 'migrations', '20260217_initial_schema.sql');
        const migrationSQL = readFileSync(migrationPath, 'utf-8');

        console.log('📄 Migration carregada:', migrationPath);
        console.log('📊 Tamanho:', migrationSQL.length, 'caracteres\n');

        // Executar migration
        console.log('⚙️  Executando SQL...');
        const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

        if (error) {
            // Se exec_sql não existir, tentar executar diretamente via REST API
            console.log('⚠️  RPC exec_sql não disponível, tentando via REST API...\n');

            // Dividir em statements individuais e executar
            const statements = migrationSQL
                .split(';')
                .map(s => s.trim())
                .filter(s => s.length > 0 && !s.startsWith('--'));

            console.log(`📝 Executando ${statements.length} statements SQL...\n`);

            for (let i = 0; i < statements.length; i++) {
                const stmt = statements[i];
                if (stmt.length === 0) continue;

                console.log(`[${i + 1}/${statements.length}] Executando...`);

                // Usar query raw do Supabase
                const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': supabaseKey,
                        'Authorization': `Bearer ${supabaseKey}`
                    },
                    body: JSON.stringify({ query: stmt + ';' })
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`❌ Erro no statement ${i + 1}:`, errorText);
                    throw new Error(`Migration falhou no statement ${i + 1}`);
                }
            }

            console.log('\n✅ Migration aplicada com sucesso via REST API!');
        } else {
            console.log('✅ Migration aplicada com sucesso via RPC!');
            console.log('Resultado:', data);
        }

        // Verificar se tabelas foram criadas
        console.log('\n🔍 Verificando tabelas criadas...');
        const { data: tables, error: tablesError } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public');

        if (tablesError) {
            console.log('⚠️  Não foi possível verificar tabelas:', tablesError.message);
        } else {
            console.log('📋 Tabelas encontradas:', tables?.map(t => t.table_name).join(', '));
        }

        console.log('\n🎉 Configuração completa!');
        console.log('🔗 Dashboard:', `${supabaseUrl.replace('https://', 'https://app.supabase.com/project/')}`);

    } catch (error) {
        console.error('\n❌ Erro ao aplicar migration:', error);
        process.exit(1);
    }
}

applyMigration();
