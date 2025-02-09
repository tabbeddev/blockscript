class _Selector:
    base_selector = ""

    def __init__(self, filters: dict = {}) -> None:
        self.filters = filters

    def __str__(self) -> str:
        """
        Converts abstracted selector into minecraft selector
        """
        selector = self.base_selector

        if self.filters:
            selector += "["

            for option, value in self.filters.items():
                assert (
                    type(option) is str and type(value) is str
                ), "options and values must both be strings"
                selector += option + "=" + value + ","

            selector = selector.removesuffix(",")
            selector += "]"

        return selector


class Everyone(_Selector):
    base_selector = "@a"


class Everything(_Selector):
    base_selector = "@e"


class This(_Selector):
    base_selector = "@s"


class Random(_Selector):
    base_selector = "@r"


class NearestPlayer(_Selector):
    base_selector = "@p"
