"""Configura SQL Server local en user-secrets sin credenciales en argumentos."""
import getpass
import json
from pathlib import Path
import subprocess
import sys


def connection_value(value):
    # ADO.NET admite valores entre comillas dobles y comillas internas duplicadas.
    return '"' + value.replace('"', '""') + '"'


def main():
    if not sys.stdin.isatty():
        print('Ejecuta este comando directamente en una terminal interactiva.')
        return 1
    username = input('Usuario SQL Server [sa]: ').strip() or 'sa'
    password = getpass.getpass('Contraseña SQL Server (no se muestra): ')
    if not password:
        print('No se guardó nada: la contraseña no puede estar vacía.')
        return 1
    connection = (
        'Server=127.0.0.1,1433;Database=InnovationHub_Tarea3_Dev;'
        f'User Id={connection_value(username)};Password={connection_value(password)};'
        'Encrypt=True;TrustServerCertificate=True'
    )
    project = Path(__file__).resolve().parents[1]
    try:
        result = subprocess.run(
            ['dotnet', 'user-secrets', 'set', '--project', str(project)],
            input=json.dumps({'ConnectionStrings:InnovationHub': connection}),
            text=True, capture_output=True, check=False,
        )
    except FileNotFoundError:
        print('No se encontró dotnet. Instala el SDK indicado en global.json.')
        return 1
    if result.returncode:
        print('No se pudo guardar el secreto. Comprueba SDK y ubicación del proyecto.')
        return 1
    print('Conexión guardada en user-secrets para InnovationHub_Tarea3_Dev.')
    print('No se ha creado ni modificado la base. La conexión se validará al migrar.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
