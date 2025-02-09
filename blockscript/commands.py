from blockscript.utils import convert_from_advanced_syntax
from .selectors import _Selector, This


class _if:
    def __init__(self, parent, condition) -> None:
        # TODO : replace condition with abstraction
        self.condition = condition
        self.parent = parent
        self.then_commands = []
        self.else_commands = []

    def then(self, *commands):
        assert self.then_commands == [], "then block is already defined"
        self.then_commands.extend(commands)
        return self

    def else_(self, *commands):
        assert self.else_commands == [], "else block is already defined"
        self.else_commands.extend(commands)
        return self

    def __compile__(self) -> list[dict]:
        assert self.then_commands, "then block must be defined"
        base = []

        if self.then_commands:
            base.append(
                {
                    "type": "dynamic_func",
                    "caller_prefix": self.parent._complete_command_(
                        "", ["if " + self.condition]
                    ),
                    "commands": self.then_commands,
                }
            )

        if self.else_commands:
            base.append(
                {
                    "type": "dynamic_func",
                    "caller_prefix": self.parent._complete_command_(
                        "", ["unless " + self.condition]
                    ),
                    "commands": self.else_commands,
                }
            )

        return base


class CommandList:
    def _complete_command_(self, command, extended_execute_options: list[str] = []):
        if self.execute_options or extended_execute_options:
            return f"execute {' '.join(self.execute_options + extended_execute_options + [''])}run {command.strip()}"
        else:
            return command

    def __init__(self, parent_class, execute_options: list[str] = []) -> None:
        self.parent_class = parent_class  # cant import Datapack due to circular import
        self.execute_options: list[str] = execute_options

    # execute options

    def e_(self, option: str):
        """
        Adds execute option.
        Usage not recommended unless nessescary
        """

        self.execute_options += [option]
        return self

    def as_entity(self, selector: _Selector | str):
        "Sets the executor to target entity"
        return self.e_("as " + str(selector))

    def at(self, location: _Selector | str):
        "Sets the execution position to entity or coordinates"

        option = "positioned " if " " in str(location) else "at "
        return self.e_(option + str(location))

    def anchored(self, location: str):
        "Sets the execution anchor to the eyes or feet"
        assert location in ("feet", "eyes"), 'anchored must either be "feet" or "eyes"'

        return self.e_("anchor " + location)

    def facing(self, location: _Selector | str):
        "Sets the execution rotation to face a given point, as viewed from its anchor (either the eyes or the feet)"
        return self.e_("facing " + str(location))

    def in_dimension(self, dimension: str):
        "Sets the execution dimension"
        return self.e_("in " + dimension)

    def on(self, relation: str):
        "Updates the executor to entities selected based on relation to the current executor entity"
        return self.e_("on " + relation)

    def rotated(self, rotation: str):
        "Sets the execution rotation; can match an entity's rotation"
        return self.e_("rotated " + rotation)

    # if

    def if_(self, condition: str) -> _if:
        return _if(self, condition)

    # commands

    def _(self, command: str) -> str:
        """
        Executes minecraft command.
        Usage not recommended unless nessescary
        """

        # Check if command is string
        assert type(command) is str

        # TODO : maybe add a syntax checker

        return self._complete_command_(command)

    def tellraw(self, text: str, selector: _Selector | str = This()) -> str:
        """
        Prints one message into the chat.
        Uses bs advanced syntax
        """

        return self._complete_command_(
            f"tellraw {selector} {convert_from_advanced_syntax(text)}"
        )

    def summon(
        self,
        entity: str,
        nbt: str = "",
        coords: str = "~ ~ ~",
    ) -> str:
        return self._complete_command_(f"summon {entity} {coords} {nbt}")

    def playsound(
        self,
        sound: str,
        channel: str = "master",
        targets: str | _Selector | None = This(),
        coords: str = "~ ~ ~",
        volume: float = 1.0,
        pitch: float = 1.0,
    ):
        return self._complete_command_(
            f"playsound {sound} {channel} {targets} {coords} {volume} {pitch}"
        )
