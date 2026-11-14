$filepath = 'C:\Project\Schematrix\schematrix-main\lib\schemeSeed.ts'
$content = Get-Content -LiteralPath $filepath -Encoding UTF8 -Raw

# Define replacements - use simple strings
$replacements = @()
$replacements += @{ old = "'పాత్ర రైతు కుటుంబాలకు sensations Visva...'"; new = "null" }
$replacements += @{ old = "'అప్ర united బ్యాంక్ ఆఫ్ ఇండియా...'"; new = "null" }
$replacements += @{ old = "'గర్భజే.mock→t.'"; new = "null" }

# For star patterns - try different newline combinations
$patterns = @(
    "summaryTe:`n    '*`n    intendedBeneficiaries:",
    "summaryTe:`r`n    '*`r`n    intendedBeneficiaries:",
    "summaryTe:`n    '*`n",
    "summaryTe:`r`n    '*`r`n",
)

foreach ($p in $patterns) {
    $count = [regex]::Matches($content, [regex]::Escape($p)).Count
    if ($count -gt 0) {
        $content = $content -replace [regex]::Escape($p), "summaryTe: null,`n    intendedBeneficiaries:"
        Write-Output "Replaced $count occurrence(s) of pattern: $p"
    }
}

# Simple replacements
foreach ($rep in $replacements) {
    $count = [regex]::Matches($content, [regex]::Escape($rep.old)).Count
    if ($count -gt 0) {
        $content = $content -replace [regex]::Escape($rep.old), $rep.new
        Write-Output "Replaced $count occurrence(s) of: $($rep.old.Substring(0,[Math]::Min(40,$rep.old.Length)))"
    } else {
        Write-Output "NOT FOUND: $($rep.old.Substring(0,[Math]::Min(40,$rep.old.Length)))"
    }
}

Set-Content -LiteralPath $filepath -Value $content -Encoding UTF8 -NoNewline
Write-Output "Done."
