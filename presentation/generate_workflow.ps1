Add-Type -AssemblyName System.Drawing

$width = 1600
$height = 560
$bmp = New-Object System.Drawing.Bitmap($width, $height)
$g = [System.Drawing.Graphics]::FromImage($bmp)

$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

# Background: White
$bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$g.FillRectangle($bgBrush, 0, 0, $width, $height)

# Top Banner
$titleCardBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(248, 250, 252))
$titleCardPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(226, 232, 240), [float]1.5)
$g.FillRectangle($titleCardBrush, [float]40, [float]20, [float]1520, [float]65)
$g.DrawRectangle($titleCardPen, [float]40, [float]20, [float]1520, [float]65)

# Fonts
$fontBanner = New-Object System.Drawing.Font('Segoe UI', [float]16, [System.Drawing.FontStyle]::Bold)
$fontSub = New-Object System.Drawing.Font('Segoe UI', [float]10, [System.Drawing.FontStyle]::Regular)
$fontBadge = New-Object System.Drawing.Font('Segoe UI', [float]9, [System.Drawing.FontStyle]::Bold)
$fontStepTitle = New-Object System.Drawing.Font('Segoe UI', [float]14, [System.Drawing.FontStyle]::Bold)
$fontStepDesc = New-Object System.Drawing.Font('Segoe UI', [float]10, [System.Drawing.FontStyle]::Regular)
$fontArrow = New-Object System.Drawing.Font('Segoe UI', [float]24, [System.Drawing.FontStyle]::Bold)

# Brushes
$textDark = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15, 23, 42))
$textMuted = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(100, 116, 139))
$textDesc = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(51, 65, 85))
$cardPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(226, 232, 240), [float]1.5)
$cardBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)

# Title Strings
$g.DrawString('PROJECT END-TO-END WORKFLOW (4 SIMPLE STEPS)', $fontBanner, $textDark, [float]65, [float]28)
$g.DrawString('How an academic project moves from student submission to live university showcase', $fontSub, $textMuted, [float]65, [float]56)

# Card Definitions
$cards = @(
    @{
        Step='STEP 01'; Title='1. Student Upload'; 
        Accent=[System.Drawing.Color]::FromArgb(59, 130, 246);
        Bg=[System.Drawing.Color]::FromArgb(239, 246, 255);
        Bullets=@('• Fills title, overview & tech', '• Selects category & batch', '• Adds GitHub repository link', '• Clicks "Submit Project"')
    },
    @{
        Step='STEP 02'; Title='2. Backend & DB'; 
        Accent=[System.Drawing.Color]::FromArgb(99, 102, 241);
        Bg=[System.Drawing.Color]::FromArgb(238, 242, 255);
        Bullets=@('• Node.js validates form data', '• Stores screenshot on disk', '• Inserts record in MySQL', '• Sets status: "Pending"')
    },
    @{
        Step='STEP 03'; Title='3. Faculty Review'; 
        Accent=[System.Drawing.Color]::FromArgb(245, 158, 11);
        Bg=[System.Drawing.Color]::FromArgb(254, 243, 199);
        Bullets=@('• Evaluates pending queue', '• Inspects student code', '• One-click [Approve]', '• (Or Rejects with feedback)')
    },
    @{
        Step='STEP 04'; Title='4. Live Showcase'; 
        Accent=[System.Drawing.Color]::FromArgb(16, 185, 129);
        Bg=[System.Drawing.Color]::FromArgb(220, 252, 231);
        Bullets=@('• Status changes to "Approved"', '• Instantly live on Explore', '• Searchable by batch & domain', '• Permanent campus archive')
    }
)

[float]$cardW = 320.0
[float]$cardH = 390.0
[float]$arrowW = 75.0
[float]$cardY = 115.0

for ($i = 0; $i -lt $cards.Length; $i++) {
    [float]$cardX = 40.0 + ($i * ($cardW + $arrowW))
    $c = $cards[$i]
    
    # White Card Box
    $g.FillRectangle($cardBrush, $cardX, $cardY, $cardW, $cardH)
    $g.DrawRectangle($cardPen, $cardX, $cardY, $cardW, $cardH)
    
    # Top Accent Strip
    $accentBrush = New-Object System.Drawing.SolidBrush($c.Accent)
    $g.FillRectangle($accentBrush, $cardX, $cardY, $cardW, [float]8.0)
    
    # Step Badge
    $stepBadgeBrush = New-Object System.Drawing.SolidBrush($c.Bg)
    $stepTextBrush = New-Object System.Drawing.SolidBrush($c.Accent)
    $g.FillRectangle($stepBadgeBrush, [float]($cardX + 24.0), [float]($cardY + 30.0), [float]85.0, [float]26.0)
    $g.DrawString($c.Step, $fontBadge, $stepTextBrush, [float]($cardX + 38.0), [float]($cardY + 35.0))
    
    # Card Title
    $g.DrawString($c.Title, $fontStepTitle, $textDark, [float]($cardX + 24.0), [float]($cardY + 75.0))
    
    # Divider line
    $g.DrawLine($cardPen, [float]($cardX + 24.0), [float]($cardY + 115.0), [float]($cardX + $cardW - 24.0), [float]($cardY + 115.0))
    
    # Bullets
    [float]$bulletY = $cardY + 140.0
    foreach ($b in $c.Bullets) {
        $g.DrawString($b, $fontStepDesc, $textDesc, [float]($cardX + 24.0), $bulletY)
        $bulletY += 48.0
    }
    
    # Arrow (if not last)
    if ($i -lt ($cards.Length - 1)) {
        [float]$arrX = $cardX + $cardW + 18.0
        [float]$arrY = $cardY + 160.0
        $arrowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(148, 163, 184))
        $g.DrawString('➔', $fontArrow, $arrowBrush, $arrX, $arrY)
    }
}

$outPath = 'A:\Hackthon - work\presentation\slide5_workflow.png'
$bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$bmp.Dispose()
Write-Output "GENERATED_WORKFLOW: $outPath"
