# Script d'aide pour configurer automatiquement la base de données MySQL
# Usage: .\setup-database.ps1

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Configuration Base de Données Urbains" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Fonction pour vérifier si MySQL est installé
function Test-MySQL {
    try {
        $mysqlVersion = mysql --version 2>$null
        if ($mysqlVersion) {
            Write-Host "✅ MySQL détecté: $mysqlVersion" -ForegroundColor Green
            return $true
        }
    } catch {
        Write-Host "⚠️  MySQL n'est pas dans le PATH" -ForegroundColor Yellow
        Write-Host "   Assurez-vous que MySQL est installé et ajouté au PATH" -ForegroundColor Yellow
        return $false
    }
    return $false
}

# Fonction pour tester la connexion MySQL
function Test-MySQLConnection {
    param(
        [string]$User,
        [string]$Password,
        [string]$Host = "localhost",
        [string]$Port = "3306"
    )
    
    $testCommand = "mysql -h $Host -P $Port -u $User -p$Password -e 'SELECT 1;' 2>&1"
    try {
        $result = Invoke-Expression $testCommand
        if ($LASTEXITCODE -eq 0) {
            return $true
        }
    } catch {
        return $false
    }
    return $false
}

# Fonction pour créer la base de données
function New-MySQLDatabase {
    param(
        [string]$User,
        [string]$Password,
        [string]$DatabaseName,
        [string]$Host = "localhost",
        [string]$Port = "3306"
    )
    
    Write-Host "`n📦 Création de la base de données '$DatabaseName'..." -ForegroundColor Cyan
    
    $createDbCommand = "mysql -h $Host -P $Port -u $User -p$Password -e `"CREATE DATABASE IF NOT EXISTS $DatabaseName CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`" 2>&1"
    
    try {
        $result = Invoke-Expression $createDbCommand
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Base de données '$DatabaseName' créée avec succès!" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ Erreur lors de la création de la base de données" -ForegroundColor Red
            Write-Host $result -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ Erreur: $_" -ForegroundColor Red
        return $false
    }
}

# Fonction pour générer un secret aléatoire
function New-RandomSecret {
    $guid1 = [System.Guid]::NewGuid().ToString()
    $guid2 = [System.Guid]::NewGuid().ToString()
    $combined = $guid1 + $guid2
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($combined)
    $secret = [Convert]::ToBase64String($bytes)
    return $secret.Substring(0, [Math]::Min(32, $secret.Length))
}

# Vérifier si .env existe déjà
if (Test-Path .env) {
    Write-Host "⚠️  Le fichier .env existe déjà!" -ForegroundColor Yellow
    $overwrite = Read-Host "Voulez-vous le remplacer? (o/n)"
    if ($overwrite -ne "o" -and $overwrite -ne "O") {
        Write-Host "Annulé." -ForegroundColor Yellow
        exit
    }
}

Write-Host "`n🔧 Configuration de la base de données MySQL" -ForegroundColor Cyan
Write-Host ""

# Vérifier MySQL
$mysqlInstalled = Test-MySQL
if (-not $mysqlInstalled) {
    Write-Host "`n❌ MySQL n'est pas détecté dans le PATH." -ForegroundColor Red
    Write-Host "   Veuillez installer MySQL ou l'ajouter au PATH." -ForegroundColor Yellow
    Write-Host "   Téléchargement: https://dev.mysql.com/downloads/mysql/" -ForegroundColor Cyan
    exit 1
}

# Demander les informations de connexion
Write-Host "Entrez les informations de connexion MySQL:" -ForegroundColor Yellow
Write-Host ""

$host = Read-Host "Host [localhost]"
if ([string]::IsNullOrWhiteSpace($host)) {
    $host = "localhost"
}

$port = Read-Host "Port [3306]"
if ([string]::IsNullOrWhiteSpace($port)) {
    $port = "3306"
}

$user = Read-Host "Utilisateur [root]"
if ([string]::IsNullOrWhiteSpace($user)) {
    $user = "root"
}

$securePassword = Read-Host "Mot de passe" -AsSecureString
$password = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
)

$databaseName = Read-Host "Nom de la base de données [urbains]"
if ([string]::IsNullOrWhiteSpace($databaseName)) {
    $databaseName = "urbains"
}

Write-Host "`n🔍 Test de la connexion MySQL..." -ForegroundColor Cyan

# Tester la connexion
$connectionTest = Test-MySQLConnection -User $user -Password $password -Host $host -Port $port

if (-not $connectionTest) {
    Write-Host "❌ Impossible de se connecter à MySQL!" -ForegroundColor Red
    Write-Host "   Vérifiez vos identifiants et que MySQL est démarré." -ForegroundColor Yellow
    Write-Host "   Windows: Services → MySQL → Démarrer" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Connexion réussie!" -ForegroundColor Green

# Créer la base de données
$dbCreated = New-MySQLDatabase -User $user -Password $password -DatabaseName $databaseName -Host $host -Port $port

if (-not $dbCreated) {
    Write-Host "❌ Échec de la création de la base de données" -ForegroundColor Red
    exit 1
}

# Construire l'URL de connexion
$databaseUrl = "mysql://${user}:${password}@${host}:${port}/${databaseName}"

# Générer le secret NextAuth
Write-Host "`n🔐 Génération du secret NextAuth..." -ForegroundColor Cyan
$nextAuthSecret = New-RandomSecret
Write-Host "✅ Secret généré!" -ForegroundColor Green

# Créer le fichier .env
Write-Host "`n📝 Création du fichier .env..." -ForegroundColor Cyan

$envContent = @"
# URL de la base de données MySQL
DATABASE_URL="$databaseUrl"

# Secret pour NextAuth.js (généré automatiquement)
NEXTAUTH_SECRET="$nextAuthSecret"

# URL de l'application
NEXTAUTH_URL="http://localhost:3000"
"@

$envContent | Out-File -FilePath .env -Encoding UTF8 -NoNewline

Write-Host "✅ Fichier .env créé!" -ForegroundColor Green

# Générer le client Prisma
Write-Host "`n🔧 Génération du client Prisma..." -ForegroundColor Cyan
try {
    npm run db:generate
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Client Prisma généré!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Erreur lors de la génération du client Prisma" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Erreur: $_" -ForegroundColor Yellow
}

# Pousser le schéma vers la base de données
Write-Host "`n📦 Création des tables dans la base de données..." -ForegroundColor Cyan
try {
    npm run db:push
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Tables créées avec succès!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Erreur lors de la création des tables" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Erreur: $_" -ForegroundColor Yellow
}

# Proposer de lancer le seed
Write-Host "`n🌱 Voulez-vous peupler la base de données avec des données de test?" -ForegroundColor Yellow
Write-Host "   Cela créera des comptes admin et agent par défaut." -ForegroundColor Gray
$runSeed = Read-Host "   Lancer le seed? (o/n) [o]"

if ([string]::IsNullOrWhiteSpace($runSeed) -or $runSeed -eq "o" -or $runSeed -eq "O") {
    Write-Host "`n🌱 Peuplement de la base de données..." -ForegroundColor Cyan
    try {
        npm run db:seed
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Base de données peuplée avec succès!" -ForegroundColor Green
            Write-Host "`n📋 Comptes créés:" -ForegroundColor Cyan
            Write-Host "   👤 Admin: admin@urbains.fr / admin123" -ForegroundColor White
            Write-Host "   👤 Agent: agent@urbains.fr / agent123" -ForegroundColor White
        } else {
            Write-Host "⚠️  Erreur lors du peuplement" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️  Erreur: $_" -ForegroundColor Yellow
    }
}

# Résumé final
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  ✅ Configuration terminée!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Résumé:" -ForegroundColor Cyan
Write-Host "   ✅ Base de données créée: $databaseName" -ForegroundColor White
Write-Host "   ✅ Fichier .env créé" -ForegroundColor White
Write-Host "   ✅ Client Prisma généré" -ForegroundColor White
Write-Host "   ✅ Tables créées" -ForegroundColor White
if ($runSeed -eq "o" -or $runSeed -eq "O" -or [string]::IsNullOrWhiteSpace($runSeed)) {
    Write-Host "   ✅ Données de test ajoutées" -ForegroundColor White
}
Write-Host ""
Write-Host "🚀 Prochaines étapes:" -ForegroundColor Yellow
Write-Host "   1. Lancez le serveur: npm run dev" -ForegroundColor White
Write-Host "   2. Ouvrez http://localhost:3000" -ForegroundColor White
Write-Host "   3. Connectez-vous avec un compte créé" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Important:" -ForegroundColor Yellow
Write-Host "   - Changez les mots de passe par défaut en production!" -ForegroundColor White
Write-Host "   - Ne partagez jamais votre fichier .env!" -ForegroundColor White
Write-Host ""
