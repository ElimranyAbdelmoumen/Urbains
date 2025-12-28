# Script d'aide pour configurer la base de donnees
# Usage: .\setup-database.ps1

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Configuration Base de Donnees Urbains" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Ce script va vous aider a creer le fichier .env" -ForegroundColor Yellow
Write-Host ""

# Verifier si .env existe deja
if (Test-Path .env) {
    Write-Host "ATTENTION: Le fichier .env existe deja!" -ForegroundColor Red
    $overwrite = Read-Host "Voulez-vous le remplacer? (o/n)"
    if ($overwrite -ne "o") {
        Write-Host "Annule." -ForegroundColor Yellow
        exit
    }
}

Write-Host "Choisissez votre fournisseur de base de donnees:" -ForegroundColor Green
Write-Host "1. Supabase (Recommandé - Gratuit)"
Write-Host "2. Neon.tech (Gratuit)"
Write-Host "3. PostgreSQL local"
Write-Host "4. J'ai deja une connection string"
Write-Host ""

$choice = Read-Host "Votre choix (1-4)"

$databaseUrl = ""

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "Instructions pour Supabase:" -ForegroundColor Cyan
        Write-Host "1. Allez sur https://supabase.com"
        Write-Host "2. Creez un compte et un nouveau projet"
        Write-Host "3. Settings > Database > Connection string (URI)"
        Write-Host "4. Copiez la connection string"
        Write-Host ""
        $databaseUrl = Read-Host "Collez votre connection string Supabase ici"
    }
    "2" {
        Write-Host ""
        Write-Host "Instructions pour Neon:" -ForegroundColor Cyan
        Write-Host "1. Allez sur https://neon.tech"
        Write-Host "2. Creez un compte et un nouveau projet"
        Write-Host "3. Copiez la connection string du dashboard"
        Write-Host ""
        $databaseUrl = Read-Host "Collez votre connection string Neon ici"
    }
    "3" {
        Write-Host ""
        Write-Host "Configuration PostgreSQL local:" -ForegroundColor Cyan
        $user = Read-Host "Nom d'utilisateur PostgreSQL (defaut: postgres)"
        if ([string]::IsNullOrWhiteSpace($user)) { $user = "postgres" }
        $password = Read-Host "Mot de passe PostgreSQL" -AsSecureString
        $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
        $plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
        $host = Read-Host "Host (defaut: localhost)"
        if ([string]::IsNullOrWhiteSpace($host)) { $host = "localhost" }
        $port = Read-Host "Port (defaut: 5432)"
        if ([string]::IsNullOrWhiteSpace($port)) { $port = "5432" }
        $db = Read-Host "Nom de la base (defaut: urbains)"
        if ([string]::IsNullOrWhiteSpace($db)) { $db = "urbains" }
        $databaseUrl = "postgresql://${user}:${plainPassword}@${host}:${port}/${db}?schema=public"
    }
    "4" {
        $databaseUrl = Read-Host "Collez votre connection string complete"
    }
    default {
        Write-Host "Choix invalide!" -ForegroundColor Red
        exit
    }
}

# Generer NEXTAUTH_SECRET
$nextAuthSecret = [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Creer le contenu du fichier .env
$envContent = "# Database`nDATABASE_URL=`"$databaseUrl`"`n`n# NextAuth`nNEXTAUTH_URL=`"http://localhost:3000`"`nNEXTAUTH_SECRET=`"$nextAuthSecret`"`n`n# App`nNODE_ENV=`"development`""

# Ecrire le fichier .env
try {
    $envContent | Out-File -FilePath .env -Encoding utf8 -NoNewline
    Write-Host ""
    Write-Host "SUCCES: Fichier .env cree avec succes!" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "Prochaines etapes:" -ForegroundColor Yellow
    Write-Host "1. npm run db:push    (Creer les tables)"
    Write-Host "2. npm run db:seed    (Creer des donnees de test)"
    Write-Host "3. npm run dev        (Lancer l'application)"
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "ERREUR lors de la creation du fichier .env" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Creez le fichier .env manuellement avec ce contenu:" -ForegroundColor Yellow
    Write-Host $envContent
}
