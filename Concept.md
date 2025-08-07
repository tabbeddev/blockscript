# Storages

A blockscript datapack has its own data storage controlled by the datapack metadata, which is reduced to only lower-case alphanumeric characters and underscores.

**Example**:

| Name            | Value                          |
| --------------- | ------------------------------ |
| Datapack name   | MultiBlock                     |
| Datapack author | _It's me_                      |
| Storage name    | blockscript_its_me:multiblock/ |

That way one datapack author has it's own storage for his datapacks, which also allowes more easy uninstallation, when you want to uninstall all datapacks by one author.

In the root of one datapack storage will be blockscript-internal variables stored, like:

- `hasCrashed` (turns true when one command unexpectedly failed - prevents all other code execution from one datapack when true)
- metadata

and so on...

These "sub-directories" will also exist:

- the UUID of an entity with local variables
- `global` for global variables
- `temp` for temporary variables during code execution

So a complete storage could look something like this:

```json
{
	"author": "It's me",
	"name": "Multiblock",
	"global": {
		"coolArray": [1, 2, 3, 4]
	},
	"-2109539763.-1400289113.-16071148240.930317702": {
		"coolNumber": 42,
		"coolString": ["T", "e", "s", "t"] // See Data Types for why this is stored like this
	},
	"temp": {
		// ...
	}
}
```

# Data Types

## String

A String does not use the real Minecraft Data String, but instead a char[] as it allowes more operations to do with the string, like indexing.

When it comes to use the string inside a [text component](https://minecraft.wiki/w/Text_component_format) (like during /tellraw), use the [NBT text component](https://minecraft.wiki/w/Text_component_format#NBT_Values) with `interpret: true` to not print the array.

## Numbers ( Integers and Floats )

A Number uses the Minecraft Data Number, but falls back to scores when it comes to binary operations. As scores only support integers and not decimal numbers, a compromise must be made while converting to scores and back. The conversion has to use a specific scale (by default 1000, but configurable). This would use 1000 for converting to score and 0.001 (1 / scale). This calculation would be made during compiling.

## Arrays

An Array uses the Minecraft Data Array.

# How it all works

Using a lot of function macros.

> [!TODO]
> Explain more