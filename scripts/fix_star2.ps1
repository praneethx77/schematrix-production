$f = 'C:\Project\Schematrix\schematrix-main\lib\schemeSeed.ts'
$bytes = [System.IO.File]::ReadAllBytes($f)
$str = [System.Text.Encoding]::UTF8.GetString($bytes)

# Pattern: summaryTe:\n    ' ＊

    intendedBeneficiaries:
$old = "summaryTe:`n    '*`n`n    intendedBeneficiaries:"
$new = "summaryTe: null,`n    intendedBeneficiaries:"

# Count matches using Contains
$count = 0
$temp = $str
while ($temp.Contains($old)) {
    $count++
    $idx = $temp.IndexOf($old)
    $temp = $temp.Substring($idx + $old.Length)
}

Write-Output "Pattern matches: $count"

if ($count -gt 0) {
    $str = $str -replace [regex]::Escape($old), $new
    Write-Output "Replaced $count patterns"
}

[System.IO.File]::WriteAllText($f, $str, [System.Text.Encoding]::UTF8)
Write-Output "Done."
