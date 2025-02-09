from blockscript import Datapack, mcfunction
from blockscript.selectors import Everyone, This


class example_pack(Datapack):
    @mcfunction
    def __tick__(self):
        return (
            self(Everyone({"tag": "interested", "team": "netherracks"}))._(
                'title @s actionbar [{"text":""},{"text":"You are: "},{"selector":"@s"}]'  # generic function call with selector override specified
            ),
        )

    @mcfunction
    def __load__(self):
        return (self().tellraw("Example pack loaded!", Everyone()),)

    @mcfunction
    def whoami(self):
        return (
            self().tellraw(
                "You are: &<selector: @s>"  # abstracted function call without selector override specified
            ),
        )

    @mcfunction
    def sheepster(self):
        return (
            self()
            .anchored("eyes")
            .at("^ ^ ^2")
            .summon("sheep", """{CustomName:'"jeb_"'}"""),
            self().tellraw("&6Here's a sheep for you!"),
            self().tellraw(
                "&a&<selector: @s> got a sheep!", Everyone({"distance": "1.."})
            ),
            self()
            .at(This())
            .as_entity(Everyone({"distance": "1.."}))
            .at(This())
            .playsound("minecraft:entity.player.level_up"),
        )


dp = example_pack()


def test_compiled():
    expected = {
        "__tick__": (
            'execute as @a[tag=interested,team=netherracks] run title @s actionbar [{"text":""},{"text":"You are: "},{"selector":"@s"}]',
        ),
        "__load__": ('tellraw @a "Example pack loaded!"',),
        "whoami": ('tellraw @s "You are: &<selector: @s>"',),
        "sheepster": (
            "execute anchor eyes positioned ^ ^ ^2 run summon sheep ~ ~ ~ {CustomName:'\"jeb_\"'}",
            'tellraw @s "&6Here\'s a sheep for you!"',
            'tellraw @a[distance=1..] "&a&<selector: @s> got a sheep!"',
            "execute at @s as @a[distance=1..] at @s run playsound minecraft:entity.player.level_up master @s ~ ~ ~ 1.0 1.0",
        ),
    }

    got = dp.compile("", test_mode=True)
    assert expected == got


if __name__ == "__main__":
    dp.compile("/tmp/", overwrite=True)
