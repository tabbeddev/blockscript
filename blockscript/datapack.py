import os
import json
from datetime import datetime

from .utils import methodsWithDecorator
from .selectors import _Selector
from .commands import CommandList


class Datapack:
    description = "BlockScript Datapack"

    def __call__(self, selector: str | _Selector | None = None) -> CommandList:
        if selector:
            return CommandList(self, [f"as {selector}"])
        else:
            return CommandList(self, [])

    def compile(
        self, path: str, overwrite: bool = False, test_mode: bool = False
    ) -> None | dict:
        """
        Compiles into minecraft Datapack
        """

        if test_mode:
            print(
                "Starting in test mode!\nWill not compile datapack but return functions array."
            )

        start = datetime.now()

        # Precompiling...

        print("Starting precompilation...")
        dp_name = self.__class__.__name__
        functions = {}

        mcfunctions = methodsWithDecorator(self.__class__, "mcfunction")
        for function in mcfunctions:
            func = getattr(self, function)
            name = func.__name__

            print("Precompiling " + name)
            assert name not in functions, f'function "{name}" is already defined!'

            commands = func()

            assert type(commands) is tuple, "mcfunction returns must be tuple"

            compiled_commpands = []
            dynamic_func_counter = 0

            for c in commands:
                if type(c) is str:
                    compiled_commpands.append(c)
                else:
                    for f in c.__compile__():
                        match f["type"]:
                            case "dynamic_func":
                                dynamic_func_counter += 1
                                functions["bs_dynamic/" + str(dynamic_func_counter)] = (
                                    f["commands"]
                                )
                                compiled_commpands.append(
                                    f'{f["caller_prefix"]}function dp_name:bs_dynamic/{dynamic_func_counter}'
                                )

                            case _:
                                raise Exception("Unhandelled command: " + str(dict))

            functions[name] = tuple(compiled_commpands)

        if test_mode:
            return functions

        # Compiling into datapack ...

        path = path.removesuffix("/") + "/"

        functions_path = f"{path}{dp_name}/data/{dp_name}/function"
        tags_path = f"{path}{dp_name}/data/minecraft/tags/function"

        try:
            os.makedirs(functions_path, exist_ok=overwrite)
            os.makedirs(tags_path, exist_ok=overwrite)
        except OSError:
            raise FileExistsError("export folder already exist")

        for function, commands in functions.items():
            print("Compiling " + function)

            func_path = f"{functions_path}/{function}.mcfunction"
            os.makedirs(func_path.rsplit("/", 1)[0], exist_ok=True)

            with open(func_path, "w") as f:
                f.write("\n".join(commands))

            if function == "__tick__":
                with open(f"{tags_path}/tick.json", "w") as f:
                    json.dump({"tick": [dp_name + "/__tick__"]}, f)

            if function == "__load__":
                with open(f"{tags_path}/load.json", "w") as f:
                    json.dump({"load": [dp_name + "/__load__"]}, f)

        delta = datetime.now() - start
        print(
            f"\nCompilation took: {delta.microseconds} µs\nCompiled to: {path}{dp_name}"
        )
