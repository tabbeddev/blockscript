from blockscript import Datapack, mcfunction


class example2_pack(Datapack):
    @mcfunction
    def is_plains(self):
        return (
            self()
            .if_("biome ~ ~ ~ minecraft:plains")
            .then(self().tellraw("You are in plains"))
            .else_(self().tellraw("You are not in plains")),
        )


dp = example2_pack()


def test_compiled():
    expected = {
        "bs_dynamic/1": ['tellraw @s "You are in plains"'],
        "bs_dynamic/2": ['tellraw @s "You are not in plains"'],
        "is_plains": (
            "execute if biome ~ ~ ~ minecraft:plains run function dp_name:bs_dynamic/1",
            "execute unless biome ~ ~ ~ minecraft:plains run function dp_name:bs_dynamic/2",
        ),
    }

    got = dp.compile("", test_mode=True)
    assert expected == got


if __name__ == "__main__":
    dp.compile("/tmp/", overwrite=True)
