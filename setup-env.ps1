# Script para criar arquivo .env.local
# Execute: .\setup-env.ps1

Write-Host "🚀 Configuração do arquivo .env.local" -ForegroundColor Cyan
Write-Host ""

# Verificar se o arquivo já existe
if (Test-Path .env.local) {
    Write-Host "⚠️  O arquivo .env.local já existe!" -ForegroundColor Yellow
    $overwrite = Read-Host "Deseja sobrescrever? (s/N)"
    if ($overwrite -ne "s" -and $overwrite -ne "S") {
        Write-Host "❌ Operação cancelada." -ForegroundColor Red
        exit
    }
}

Write-Host "📝 Por favor, forneça as informações do Supabase:" -ForegroundColor Green
Write-Host ""

# Solicitar URL do Supabase
$supabaseUrl = Read-Host "1. Cole a URL do seu projeto Supabase (ex: https://xxxxx.supabase.co)"

# Validar URL
if ($supabaseUrl -notmatch "^https://.*\.supabase\.co$") {
    Write-Host "⚠️  A URL parece inválida. Continuando mesmo assim..." -ForegroundColor Yellow
}

# Solicitar chave anon
Write-Host ""
Write-Host "2. Cole a 'publishable API key' do Supabase (é uma string longa começando com eyJ...)" -ForegroundColor Green
Write-Host "   (Também pode aparecer como 'anon public' key)" -ForegroundColor Gray
$supabaseKey = Read-Host "   Publishable API Key"

# Validar chave
if ($supabaseKey -notmatch "^eyJ") {
    Write-Host "⚠️  A chave parece inválida. Continuando mesmo assim..." -ForegroundColor Yellow
}

# Criar conteúdo do arquivo
$envContent = @"
NEXT_PUBLIC_SUPABASE_URL=$supabaseUrl
NEXT_PUBLIC_SUPABASE_ANON_KEY=$supabaseKey
"@

# Escrever arquivo
try {
    $envContent | Out-File -FilePath .env.local -Encoding utf8 -NoNewline
    Write-Host ""
    Write-Host "✅ Arquivo .env.local criado com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
    Write-Host "   1. Execute a migration SQL no Supabase (supabase/migrations/001_initial_schema.sql)" -ForegroundColor White
    Write-Host "   2. Execute: npm run dev" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "❌ Erro ao criar arquivo: $_" -ForegroundColor Red
    exit 1
}

