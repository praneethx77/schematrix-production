$f = 'C:\Project\Schematrix\schematrix-main\lib\schemeSeed.ts'
$bytes = [System.IO.File]::ReadAllBytes($f)
$str = [System.Text.Encoding]::UTF8.GetString($bytes)

# Find and fix the broken line
# The line is: "    benefitsTe: null, [Telugu chars]*"
# We want: "    benefitsTe: null,"
$oldLine = "    benefitsTe: null,"
$newLine = "    benefitsTe: null,"

# Find the position of "benefitsTe: null," and remove everything until the next line
$idx = $str.IndexOf("    benefitsTe: null,")
if ($idx -ge 0) {
    # Find end of line
    $endIdx = $str.IndexOf("`n", $idx)
    if ($endIdx -lt 0) { $endIdx = $str.Length }
    # Replace the whole line
    $str = $str.Substring(0, $idx) + "    benefitsTe: null," + $str.Substring($endIdx)
    Write-Output "Fixed line at position $idx"
}

[System.IO.File]::WriteAllText($f, $str, [System.Text.Encoding]::UTF8)
Write-Output "Done."
