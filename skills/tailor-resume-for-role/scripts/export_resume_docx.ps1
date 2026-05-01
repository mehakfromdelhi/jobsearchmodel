param(
  [Parameter(Mandatory = $true)]
  [string]$InputPath,

  [Parameter(Mandatory = $true)]
  [string]$OutputPath,

  [string]$Title = "Tailored Resume"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Escape-XmlText {
  param([string]$Value)

  if ($null -eq $Value) {
    return ""
  }

  return [System.Security.SecurityElement]::Escape($Value)
}

function New-ParagraphXml {
  param(
    [string]$Text,
    [switch]$IsTitle,
    [switch]$IsBullet
  )

  $escaped = Escape-XmlText $Text
  $runProps = if ($IsTitle) { "<w:rPr><w:b/><w:sz w:val=""30""/></w:rPr>" } else { "" }

  if ($IsBullet) {
    return "<w:p><w:pPr><w:ind w:left=""720"" w:hanging=""360""/></w:pPr><w:r><w:t xml:space=""preserve"">• </w:t></w:r><w:r>$runProps<w:t xml:space=""preserve"">$escaped</w:t></w:r></w:p>"
  }

  return "<w:p><w:r>$runProps<w:t xml:space=""preserve"">$escaped</w:t></w:r></w:p>"
}

if (-not (Test-Path -LiteralPath $InputPath)) {
  throw "Input file not found: $InputPath"
}

$resolvedOutput = [System.IO.Path]::GetFullPath($OutputPath)
$outputDir = [System.IO.Path]::GetDirectoryName($resolvedOutput)

if ([string]::IsNullOrWhiteSpace($outputDir)) {
  throw "Output path must include a filename."
}

New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

$lines = Get-Content -LiteralPath $InputPath
$paragraphs = New-Object System.Collections.Generic.List[string]
$paragraphs.Add((New-ParagraphXml -Text $Title -IsTitle))

foreach ($line in $lines) {
  $trimmed = $line.Trim()

  if ([string]::IsNullOrWhiteSpace($trimmed)) {
    $paragraphs.Add("<w:p/>")
    continue
  }

  if ($trimmed.StartsWith("- ") -or $trimmed.StartsWith("* ")) {
    $paragraphs.Add((New-ParagraphXml -Text $trimmed.Substring(2).Trim() -IsBullet))
    continue
  }

  $paragraphs.Add((New-ParagraphXml -Text $line))
}

$documentXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
 xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
 xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
 xmlns:v="urn:schemas-microsoft-com:vml"
 xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing"
 xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
 xmlns:w10="urn:schemas-microsoft-com:office:word"
 xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
 xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
 xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup"
 xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk"
 xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml"
 xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"
 mc:Ignorable="w14 wp14">
  <w:body>
    $($paragraphs -join "`n    ")
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>
"@

$contentTypesXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>
"@

$rootRelsXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>
"@

$docRelsXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>
"@

$createdUtc = [DateTime]::UtcNow.ToString("s") + "Z"
$coreXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
 xmlns:dc="http://purl.org/dc/elements/1.1/"
 xmlns:dcterms="http://purl.org/dc/terms/"
 xmlns:dcmitype="http://purl.org/dc/dcmitype/"
 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>$(Escape-XmlText $Title)</dc:title>
  <dc:creator>Codex Skill</dc:creator>
  <cp:lastModifiedBy>Codex Skill</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">$createdUtc</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">$createdUtc</dcterms:modified>
</cp:coreProperties>
"@

$appXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"
 xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Codex Skill</Application>
</Properties>
"@

$tempRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("resume-docx-" + [System.Guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Force -Path $tempRoot | Out-Null

try {
  New-Item -ItemType Directory -Force -Path (Join-Path $tempRoot "_rels") | Out-Null
  New-Item -ItemType Directory -Force -Path (Join-Path $tempRoot "word") | Out-Null
  New-Item -ItemType Directory -Force -Path (Join-Path $tempRoot "word\\_rels") | Out-Null
  New-Item -ItemType Directory -Force -Path (Join-Path $tempRoot "docProps") | Out-Null

  Set-Content -LiteralPath (Join-Path $tempRoot "[Content_Types].xml") -Value $contentTypesXml -Encoding UTF8
  Set-Content -LiteralPath (Join-Path $tempRoot "_rels\\.rels") -Value $rootRelsXml -Encoding UTF8
  Set-Content -LiteralPath (Join-Path $tempRoot "word\\document.xml") -Value $documentXml -Encoding UTF8
  Set-Content -LiteralPath (Join-Path $tempRoot "word\\_rels\\document.xml.rels") -Value $docRelsXml -Encoding UTF8
  Set-Content -LiteralPath (Join-Path $tempRoot "docProps\\core.xml") -Value $coreXml -Encoding UTF8
  Set-Content -LiteralPath (Join-Path $tempRoot "docProps\\app.xml") -Value $appXml -Encoding UTF8

  if (Test-Path -LiteralPath $resolvedOutput) {
    Remove-Item -LiteralPath $resolvedOutput -Force
  }

  $zipOutput = [System.IO.Path]::ChangeExtension($resolvedOutput, '.zip')
  if (Test-Path -LiteralPath $zipOutput) {
    Remove-Item -LiteralPath $zipOutput -Force
  }

  Compress-Archive -Path (Join-Path $tempRoot '*') -DestinationPath $zipOutput -Force
  Move-Item -LiteralPath $zipOutput -Destination $resolvedOutput -Force

  Write-Output $resolvedOutput
}
finally {
  if (Test-Path -LiteralPath $tempRoot) {
    Remove-Item -LiteralPath $tempRoot -Recurse -Force
  }
}
