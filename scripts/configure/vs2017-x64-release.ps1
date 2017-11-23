#REQUIRES -Version 2.0
<#
.SYNOPSIS
    Configures and builds ArangoDB
.EXAMPLE
    mkdir arango-build; cd arangod-build; ../arangodb/scripts/configure/<this_file>
#>

$scriptPath = split-path -parent $MyInvocation.MyCommand.Definition
$arano_source = split-path -parent (split-path -parent $scriptPath)

$vcpath=$(Get-ItemProperty HKLM:\SOFTWARE\Wow6432Node\Microsoft\VisualStudio\SxS\VC7)."14.0"
$env:GYP_MSVS_OVERRIDE_PATH="${vcpath}\bin"
$env:CC="${vcpath}\bin\cl.exe"
$env:CXX="${vcpath}\bin\cl.exe"

$configuration="Release"

cmake -G "Visual Studio 15 2017 Win64" -DCMAKE_BUILD_TYPE=$configuration -DSKIP_PACKAING=ON $arango_source
cmake --config $configuration --build .
