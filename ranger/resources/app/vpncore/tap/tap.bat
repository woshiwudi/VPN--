@echo off
if /i %PROCESSOR_IDENTIFIER:~0,3%==x86 (
    cd %~dp0\x86\
    "tapinstall.exe" remove tap0901
    "tapinstall.exe" install "OemVista.inf" tap0901
) else (
    cd %~dp0\x64\
    "tapinstall.exe" remove tap0901
    "tapinstall.exe" install "OemVista.inf" tap0901
)
