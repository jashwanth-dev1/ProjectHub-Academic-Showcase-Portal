Add-Type -AssemblyName System.Drawing

$width = 1600
$height = 760
$bmp = New-Object System.Drawing.Bitmap($width, $height)
$g = [System.Drawing.Graphics]::FromImage($bmp)

$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

# Background: White
$bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$g.FillRectangle($bgBrush, 0, 0, $width, $height)

# Title Header Card
$titleCardBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(248, 250, 252))
$titleCardPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(226, 232, 240), [float]1.0)
$g.FillRectangle($titleCardBrush, [float]40, [float]20, [float]1520, [float]70)
$g.DrawRectangle($titleCardPen, [float]40, [float]20, [float]1520, [float]70)

# Fonts
$fontTitle = New-Object System.Drawing.Font('Segoe UI', [float]17, [System.Drawing.FontStyle]::Bold)
$fontSubtitle = New-Object System.Drawing.Font('Segoe UI', [float]10, [System.Drawing.FontStyle]::Regular)
$fontHeader = New-Object System.Drawing.Font('Segoe UI', [float]11, [System.Drawing.FontStyle]::Bold)
$fontBold = New-Object System.Drawing.Font('Segoe UI', [float]10.5, [System.Drawing.FontStyle]::Bold)
$fontRegular = New-Object System.Drawing.Font('Segoe UI', [float]10.5, [System.Drawing.FontStyle]::Regular)
$fontPass = New-Object System.Drawing.Font('Segoe UI', [float]10.5, [System.Drawing.FontStyle]::Bold)
$fontFooter = New-Object System.Drawing.Font('Segoe UI', [float]11, [System.Drawing.FontStyle]::Bold)

# Brushes
$textDark = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15, 23, 42))
$textMuted = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(100, 116, 139))
$textWhite = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$headerBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(30, 58, 138)) # Navy Blue
$borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(226, 232, 240), [float]1.0)
$rowEvenBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$rowOddBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(248, 250, 252))

# Draw Title
$g.DrawString('TEST CASES & VERIFICATION MATRIX', $fontTitle, $textDark, [float]60, [float]30)
$g.DrawString('ProjectHub REST API & Security Verification Suite (Node.js + MySQL 8.0 + Postman)', $fontSubtitle, $textMuted, [float]60, [float]60)

# Table Dimensions
[float]$startX = 40.0
[float]$startY = 105.0
[float[]]$colWidths = @(130.0, 480.0, 420.0, 370.0, 120.0)
$headers = @('TEST ID', 'TEST SCENARIO / INPUT', 'EXPECTED RESULT', 'ACTUAL RESULT', 'STATUS')

# Draw Table Header
$g.FillRectangle($headerBg, $startX, $startY, [float]1520.0, [float]48.0)
[float]$currX = $startX
for ($i = 0; $i -lt $headers.Length; $i++) {
    [float]$cw = $colWidths[$i]
    if ($i -eq 4) {
        $sf = New-Object System.Drawing.StringFormat
        $sf.Alignment = [System.Drawing.StringAlignment]::Center
        $rect = New-Object System.Drawing.RectangleF($currX, [float]($startY + 13.0), $cw, [float]26.0)
        $g.DrawString($headers[$i], $fontHeader, $textWhite, $rect, $sf)
    } else {
        $g.DrawString($headers[$i], $fontHeader, $textWhite, [float]($currX + 15.0), [float]($startY + 13.0))
    }
    $currX += $cw
}

# Table Rows Data
$rows = @(
    @{ Id='TC-01'; Scenario='Student Login with valid credentials (student@campus.edu)'; Expected='200 OK + Signed JWT Bearer token issued'; Actual='Token received & student dashboard session loaded'; Status='PASS' },
    @{ Id='TC-02'; Scenario='Unauthenticated client accesses /api/projects/pending'; Expected='401 Unauthorized / Access Denied'; Actual='Request rejected by authenticateToken middleware'; Status='PASS' },
    @{ Id='TC-03'; Scenario='Student submits project form with missing required fields'; Expected='400 Bad Request with validation error message'; Actual='Rejection: "All required fields must be filled"'; Status='PASS' },
    @{ Id='TC-04'; Scenario='Faculty clicks Approve on a pending project submission'; Expected='Status updated to "Approved" in MySQL database'; Actual='State updated in DB; instant visibility on Explore'; Status='PASS' },
    @{ Id='TC-05'; Scenario='Student attempts to delete an already approved project'; Expected='400 Bad Request (Action forbidden for student)'; Actual='Blocked: "Approved projects cannot be deleted"'; Status='PASS' }
)

[float]$rowY = $startY + 48.0
[float]$rowHeight = 84.0

# Badges & Colors
$passBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(220, 252, 231))
$passPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(134, 239, 172), [float]1.0)
$passText = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(21, 128, 61))
$tcIdBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(239, 246, 255))
$tcIdPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(191, 219, 254), [float]1.0)
$tcIdText = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(29, 78, 216))

for ($r = 0; $r -lt $rows.Length; $r++) {
    $row = $rows[$r]
    $rBg = if ($r % 2 -eq 0) { $rowEvenBg } else { $rowOddBg }
    
    $g.FillRectangle($rBg, $startX, $rowY, [float]1520.0, $rowHeight)
    $g.DrawLine($borderPen, $startX, [float]($rowY + $rowHeight), [float]($startX + 1520.0), [float]($rowY + $rowHeight))
    
    # ID Badge
    [float]$badgeX = $startX + 20.0
    [float]$badgeY = $rowY + 26.0
    $g.FillRectangle($tcIdBg, $badgeX, $badgeY, [float]80.0, [float]32.0)
    $g.DrawRectangle($tcIdPen, $badgeX, $badgeY, [float]80.0, [float]32.0)
    $sfId = New-Object System.Drawing.StringFormat
    $sfId.Alignment = [System.Drawing.StringAlignment]::Center
    $sfId.LineAlignment = [System.Drawing.StringAlignment]::Center
    $g.DrawString($row.Id, $fontBold, $tcIdText, (New-Object System.Drawing.RectangleF($badgeX, $badgeY, [float]80.0, [float]32.0)), $sfId)

    # Scenario
    $rectScenario = New-Object System.Drawing.RectangleF([float]($startX + 145.0), [float]($rowY + 20.0), [float]460.0, [float]50.0)
    $g.DrawString($row.Scenario, $fontBold, $textDark, $rectScenario)

    # Expected
    $rectExpected = New-Object System.Drawing.RectangleF([float]($startX + 625.0), [float]($rowY + 20.0), [float]400.0, [float]50.0)
    $g.DrawString($row.Expected, $fontRegular, $textDark, $rectExpected)

    # Actual
    $rectActual = New-Object System.Drawing.RectangleF([float]($startX + 1045.0), [float]($rowY + 20.0), [float]350.0, [float]50.0)
    $g.DrawString($row.Actual, $fontRegular, $textDark, $rectActual)

    # Status Pill
    [float]$pillX = $startX + 1410.0
    [float]$pillY = $rowY + 26.0
    $g.FillRectangle($passBg, $pillX, $pillY, [float]85.0, [float]32.0)
    $g.DrawRectangle($passPen, $pillX, $pillY, [float]85.0, [float]32.0)
    $sfPill = New-Object System.Drawing.StringFormat
    $sfPill.Alignment = [System.Drawing.StringAlignment]::Center
    $sfPill.LineAlignment = [System.Drawing.StringAlignment]::Center
    $g.DrawString('PASS', $fontPass, $passText, (New-Object System.Drawing.RectangleF($pillX, $pillY, [float]85.0, [float]32.0)), $sfPill)

    $rowY += $rowHeight
}

# Table Outer Border
$g.DrawRectangle($borderPen, $startX, $startY, [float]1520.0, [float](($rowHeight * 5) + 48.0))

# Footer Summary Banner
[float]$footerY = $rowY + 18.0
$footerBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(240, 253, 244))
$footerPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(187, 247, 208), [float]1.0)
$footerText = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(22, 101, 52))

$g.FillRectangle($footerBg, $startX, $footerY, [float]1520.0, [float]48.0)
$g.DrawRectangle($footerPen, $startX, $footerY, [float]1520.0, [float]48.0)

$summaryString = 'VERIFICATION SUMMARY:  5 of 5 Test Cases Passed (100% Success Rate)   |   0 Failures   |   Environment: Node.js + Postman + MySQL 8.0'
$sfFooter = New-Object System.Drawing.StringFormat
$sfFooter.Alignment = [System.Drawing.StringAlignment]::Center
$sfFooter.LineAlignment = [System.Drawing.StringAlignment]::Center
$g.DrawString($summaryString, $fontFooter, $footerText, (New-Object System.Drawing.RectangleF($startX, $footerY, [float]1520.0, [float]48.0)), $sfFooter)

$outPath = 'A:\Hackthon - work\presentation\slide9_test_table.png'
$bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$bmp.Dispose()
Write-Output "GENERATED_SUCCESSFULLY: $outPath"
