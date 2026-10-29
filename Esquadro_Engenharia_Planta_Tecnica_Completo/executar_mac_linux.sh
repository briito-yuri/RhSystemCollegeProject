#!/bin/bash
cd "$(dirname "$0")"
echo "=== Compilando o Sistema de RH (Esquadro Engenharia) ==="
javac -encoding UTF-8 src/Objetos/*.java src/Resources/*.java src/Servidor/*.java src/MainWeb.java
if [ $? -ne 0 ]; then
    echo "Erro na compilacao!"
    exit 1
fi
echo "=== Iniciando Servidor na porta 8080 ==="
java -Dfile.encoding=UTF-8 -cp src MainWeb
