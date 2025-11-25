import uvicorn
import argparse
import os

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--db",
        choices=["local", "aiven"],
        default="local",
        help="Selecciona la base de datos a utilizar (local o aiven).",
    )
    args = parser.parse_args()

    os.environ["DB_TARGET"] = args.db

    uvicorn.run(
        "app.main:app",
        reload=True,
    )
