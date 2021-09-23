# Principle of map pixel arts

This article will introduce how minecraft map pixel arts works, including 3D, flat and file-only maps. SlopeCraft cracks on these machanisms. By learning and hacking on these machnisms, people make custom images shown of maps.

## Why Maps ?
Minecraft map pixel arts can be divided into two types: optical arts and map arts. Optical arts are built to be seen straightforwardly, they can be horizental like floors, or vertical like walls. opticacl arts are straight and simple, but they are huge, unconvenient to apperciate. But map can be put in an item frame then multiple maps together make a larger image displayed on wall of floor. That's the benefit of map arts.

In optical arts, blocks show their original texture colors, each blocks are different. However, things changed in map arts. On map, blocks are displayed in a slightly different way, many blocks have exactly identical colors on map, for example, snow and white concrete. Besides, to most blocks,  there's a slight but noticable difference between texture colors and map colors. That makes many optical maps not shown very well in maps. Thus, the first thing is to understand the machanism of minecraft maps.

<br>
<br>

## How do maps display blocks?
**Each map has a resolution of 128 × 128 pixels, which has no relation with its scale.** The region map record is determined by its scale, an integer ranging from 0 to 4. Map's corresponding region is a square, its height and weight equal to $128\times 2^{Scale}$. When scale is 0, a map records 128 × 128 blocks and each pixel correponds to 1 block, otherwise is corresponds to $2^{Scale}$ blocks. Maps with scales greater than 0 are meanningless to map pixel arts, I will no longer talk about them. I will show you the reason.

Each map is aligned automatically, to make maps joins together easier. The starting corrdinate (northwestern corner) of a map is $(128\times 2^{Scale}-64,y,128\times 2^{Scale}-64)$.

The relationship between aixs and map are as follows:
| Direction | Map Direction | Axis Direction | 
| :----: | :----: | :----: |
| North | up | z- |
| South | down | z+ |
| West | left | x- |
| East | right | x+ |

1. How do minecraft stores map datas?
   
   In Minecraft Java Edition, map contents aren't stored in each map item, but under **data** folder. their file names are like **map_i.dat**, which i is any integer no less than 0 and no greater than 2,147,483,647(32767 in 1.12, 2,147,483,647 in 1.13+). The number i is called map sequence number, each map item in game simply stores its corresponding map sequence number. 
   
   For example, if i hold a map with sequence number 3, when save is loaded, minecraft find the map data files named *map_3.dat* and load it, then its contents is shown on the map. So the essence of map is not map items, but map data files. 
   
   Almost everting of a map is stored in its map data file, including each pixel of it. To map pixel arts, the most important thing is how map pixels are stored.

2. Map pixel and map color
   
   Each map pixel is a **8-bit unsigned integer**, ranging from 0 to 255. Since map data files are in compressed NBT format, map pixel are stored in an byte array with 16384 elements.(Although byte tag in nbt is signed 8-bit integer, just take is as unsigned). The 128 × 128 pixel array is stored in row major.
   
   That determines each pixel can have at most 256 colors, each value means a different color. **The 8bit unsigned integer is called map color.** We can say that map is a 8-bit index image with fixed palette. 

3. Base color and shadow
   
   Introduced as above, map color is a 8bit-integer. The first 6 bit of it formed an 6-bit unsigned integer, called base color, and the rest 2 bit formed another 2-bit unsigned integer, shadow. Their relation can be described by following equaltion:

   $$
   MapColor=4\times BaseColor+Shadow
   $$ 
   
   Base color is determined by the block type, there can be at most 64 base colors in minecraft. However up to now(1.17), there are 62 base colors used, each has a raw RGB color. There are 52 base colors used from 1.12 to 1.15, and 59 in 1.16, and 62 in 1.17. The unused base colors don't have corresponding blocks and colors, they are meanning less to map pixel arts. 
   
   The relation of block, base color and its raw color is listed on wiki. See [Map Item Format](https://minecraft.fandom.com/wiki/Map_item_format).

   But base color's raw color doesn't equal to map color's color. The R, G and B value of raw color is multiplied by a factor and divided by 255 (round down to integer) to become map color's color. The factor is determined by shadow value.

   | Shadow value | Factor |
   | :----: | :----: |
   | 0 | 180 |
   | 1 | 220 |
   | 2 | 255 |
   | 3 | 135 |

   We can find that shadow 2 makes map color's color equals to raw color, while shadow 1 makes it darker, 0 more darker and 3 darkest.

   What does shadow mean? Shadow means the relative height among a block and its surrounding blocks. If block A's corrdinate is $(x,y_A,z)$, and its north side block B$(x,y_B,z-1)$. The shadow value of A 
   $$
    Shadow(A)=\left\{
    \begin{aligned}
        0\quad,&\quad \text{when } y_A<y_B \\
        1\quad,&\quad \text{when } y_A=y_B \\
        2\quad,&\quad \text{when } y_A>y_B
    \end{aligned}
    \right.
   $$

   Among all base colors, water(12) is the most special one. Determined by water depth, Shadow value of water is unrelated to relative height. When depth is 1(one water block), shadow is 2; when depth is 6, shadow is 1; when depth is equal or greater than 11, shadow is 0.

   Blocks are brighter when they are higher than their north side and darker when lower(when it comes to water, water is darken when deeper), **it enables map to show how landscape goes up and down.**

   **Notice that shadow is a 2-bit integer, allowing 4 values but only 3 used. The leftover one, shadow 3 work normally on map, but can never be found in vanilla survival.** I really wounder why Mojang made this happen.

4. Base color 0 is a special one
   
   Greatly different to all base colors, 0 means air or unexplored. The raw color of base color 0 is  full-transparent, letting through the background color of map item. Many transparent blocks such as glass, nether portal, torches and so on belongs to base color 0. It's weird that redstome lamp also belongs to 0.

5. Why is scaled maps meanningless?

   Acrooding to map machanism, **scaling a map do no help to promote resolution and color counts**, it's a waste of blocks and rooms.

<br>
<br>

## How do map art works?
1. 3D map art machanism
   
   In 3D maps, blocks are organised to form a pixel art. Each block plays 2 roles: 
   - Displaying its base color
   - Determine the south side block's shadow.

   So you can see, the height of each block is not organised arbitarily, but determined by map colors.

2. Flat map art machanism
   
   If you restrict that all map colors in map can only be shadow 1(shadow 2 for water), you make a flat map. Every blocks have same apititude.

3. File-only map art machanism
   
   Vanilla maps(3D and flat) make images shown by building blocks, that's the only way in vanilla survival. But if you don't attach importance to vanillaness, replacing map data files is acceptable. File-only map simpliy replace existing map data file(s) by generated file(s) to make your image displayed. **Only in this way can the third shadow be applied to map pixel arts.
**
## What is height compression?
Height compression is a new technology to decrease the maxium height of a 3D map. Since large images often result to height over 256, it makes great sence. There're 2 compression method: **lossless compression** and **lossy compression**.

1. Lossless compression
   
   Lossless compression compresses an map art with effect unchanged. It will try to sink some segments in 3d map art.

   **Lossless compression can not ensure to deflate all maps down to 256, some times a coloum of map is even uncompressale.**

2. Lossy compression
   
   Obviously lossless ompression doesn't solve the proble totally. To compress the maxium height down to any value, modifying map color of several pixel is acceptable. Lossy compression algorithm deflate the maxiun height by changing some pixel slightly, minizing the sum color difference.

   **Lossy compression is able to defalte most maps donw to any maxium height.** Implemented on genetic algorithm, it behaves slightly randomly and relatively slow.

   Although it can deflate down to any maxium height theroilically, **it's not recommended to set the maxium allowed height less than 14**, otherwise my genetic algorithm will cost greatly a long time to compress -- or even fail.

Notice that 2 methods above are parellel, which means that **you can compress with both method, or with single method**. If you enabled lossy compression, it's a good choice to enable lossless compression, it will make lossy compression **do less harm to the final map art quality**.