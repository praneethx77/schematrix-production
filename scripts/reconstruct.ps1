$f = 'C:\Project\Schematrix\schematrix-main\lib\schemeSeed.ts'
$bytes = [System.IO.File]::ReadAllBytes($f)
$str = [System.Text.Encoding]::UTF8.GetString($bytes)

# Remove BOM if present
if ($str[0] -eq "\uFEFF") { $str = $str.Substring(1) }

# Add newlines back by splitting on known patterns
# 1. Section headers
$str = $str -replace '// =+', "`n// =+"

# 2. Object boundaries - add newline before "  {" and after "  },"
$str = $str -replace '  \{', "`n  {"
$str = $str -replace '  \},', "  }," + "`n"

# 3. Property lines starting with 4 spaces
$str = $str -replace '(?<=,)\s{2,4}([a-zA-Z_])', "`n  $1"

# 4. End of array
$str = $str -replace '\];', "`n];"

# 5. Export statements
$str = $str -replace 'export ', "`nexport "

# 6. Function declarations
$str = $str -replace 'export function ', "`nexport function "

# 7. Type declarations
$str = $str -replace 'type SeedRecord', "`ntype SeedRecord"

# 8. Import statements at top
$str = $str -replace '^import ', "`nimport "

# 9. Constants
$str = $str -replace 'export const ', "`nexport const "

# 10. Interface/type
$str = $str -replace 'type ', "`ntype "

# Clean up multiple newlines
$str = $str -replace "`n{3,}", "`n`n"

# Remove leading newline
$str = $str.TrimStart("`n")

[System.IO.File]::WriteAllText($f, $str, [System.Text.Encoding]::UTF8)
Write-Output "Reconstructed file. Length: $($str.Length)"
