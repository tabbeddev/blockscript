import inspect
from warnings import warn


def convert_from_advanced_syntax(adv_text: str) -> str:
    # entries = []
    #
    # return entries
    warn("advanced syntax convertion is currently WIP!", UserWarning)

    return f'"{adv_text.replace('"', '\\"')}"'


def methodsWithDecorator(cls, decoratorName):
    # Credits : https://stackoverflow.com/a/5910893

    sourcelines = inspect.getsourcelines(cls)[0]
    for i, line in enumerate(sourcelines):
        line = line.strip()
        if line.split("(")[0].strip() == "@" + decoratorName:  # leaving a bit out
            nextLine = sourcelines[i + 1]
            name = nextLine.split("def")[1].split("(")[0].strip()
            yield (name)
