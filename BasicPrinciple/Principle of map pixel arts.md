# 地图画原理

<br>

**简体中文** | [English](./Principle%20of%20map%20pixel%20arts_EN.md)

<br>

这篇文章将会仔细介绍地图画工作原理，包括立体地图画、平板地图画和纯文件地图画。SlopeCraft正是基于这些机制开发出来的。通过研究并利用这些机制，人们可以让地图显示出自定义的图像。

## 为什么用地图？
Minecraft地图画可以分为两类：视觉型和地图型。视觉型地图画顾名思义，是建造出来直接用眼睛看的，它们可以是水平平板，也可以是垂直墙面。视觉型地图画简单直接，但往往体积巨大，不是很方便观看。然而地图可以放进物品展示框里，显示在地板或者墙上。多张地图甚至可以拼成一张更大的画面。这就是地图的优势。

在视觉型地图画中，方块直接显示它们材质贴图的颜色，每个方块都是不一样的。但地图型地图画并非如此。地图显示的颜色与方块的材质贴图可能有细微差别，很多方块拥有完全一样的颜色，比如雪块和白色混凝土。此外，对于绝大多数方块，地图显示的颜色和眼睛看到的颜色都会有细微但可察觉的差异，这导致很多视觉型的地图画在地图上表现的不太好。所以第一件事情就是弄明白Minecraft地图的机制。

<br>
<br>

## 地图如何显示方块？
**每个地图的分辨率都是 128 × 128 像素，与缩放尺度无关。** 地图对应的区域由缩放尺度scale决定，scale是一个整数，取值范围在0到4之间（包含0和4）。地图对应的区域是正方形，长宽均为$128\times 2^{Scale}$。当scale为0时，地图对应着128 × 128范围的方块，其中每个像素都代表一个方块；否则每个像素代表$2^{Scale}$个方块。scale大于0的地图对地图画而言没有意义，我不会再讨论它们，不过下文会告诉你为什么它们没有意义。

为了让地图更容易拼接，每个地图都会与一个网格自动对齐。地图起始坐标（西北角）为$(128\times 2^{Scale}-64,y,128\times 2^{Scale}-64)$。

坐标轴和东西南北的关系表：
| 方向 | 地图方向 | 坐标轴方向 | 
| :----: | :----: | :----: |
| 北 | 上 | z- |
| 南 | 下 | z+ |
| 西 | 左 | x- |
| 东 | 右 | x+ |

1. Minecraft怎样存储地图数据？
   
   在Java版中，地图的内容并没有存储在每个地图物品里，而是存储在**data**文件夹下。它们的文件名形如**map_i.dat**，i为不超过2,147,483,647（1.12中是32767）的自然数。i称为地图序号，游戏中每个地图物品都只是存储了对应的地图序号。
   
   比如，如果玩家拿着一个序号为114的地图，存档加载时Minecraft会寻找名为*map_114.dat*的地图数据文件并加载它。然后它的内容就会显示在地图上。因此，地图的本质不是物品，而是地图数据文件。
   
   地图几乎所有信息都存储在地图数据文件里，包括但不限于每个像素。地图画最重要的就是地图数据的存储方式。

2. 地图像素与地图色（MapColor）
   
   地图的每个像素都是一个8位无符号整数，取值范围为0到255。由于地图数据文件是压缩NBT格式，地图像素都存储在一个包含了16384个元素的字节数组（byte array)里（虽然NBT格式中的byte是有符号整数，但不妨当做是无符号）。这个128 × 128的像素矩阵以行优先方式存储。
   
   这决定了每个像素最多可能有256种颜色，每个值对应着不同的颜色。**这个8位无符号整数称为地图色。**我们可以说地图是一个颜色表固定的8位索引图像。

3. 基色（BaseColor）与阴影（Shadow）
   
   如上文所述，地图色是8位无符号整数。它的高6位形成了6位无符号整数，称之为基色（BaseColor)，余下2位形成了2位无符号整数，称为阴影。地图色、基色和阴影的关系如下：

   $$
   地图色=4\times 基色+阴影
   $$ 
   
   基色取决于方块类型。游戏中最多可能有64种基色。截止最新版（1.17），游戏中有62个基色已经被使用；在1.16，有69个基色被使用，每个基色都有对应的基色颜色（RGB）；从1.12到1.15，有52个基色被使用。未使用的基色没有相应的颜色，它们对地图画没有意义。
   
   wiki上有基色和方块的对照表：[地图物品格式](https://minecraft.fandom.com/zh/wiki/%E5%9C%B0%E5%9B%BE%E7%89%A9%E5%93%81%E6%A0%BC%E5%BC%8F).

   但基色颜色不等于地图色的颜色。基色颜色的R、G、B三个分量要分别乘一个因子，再除以255（向下取整）才能得到地图色的颜色。这个因子由阴影值决定。

   | 阴影值 | 因子 |
   | :----: | :----: |
   | 0 | 180 |
   | 1 | 220 |
   | 2 | 255 |
   | 3 | 135 |

   可见，阴影值为2的地图色颜色等于基色颜色，阴影值1稍暗，阴影值0更暗，阴影值3最暗。

   阴影有什么意义？阴影表示一个方块与周边方块的相对高度。如果方块A的坐标为$(x,y_A,z)$，它北侧方块B的坐标$(x,y_B,z-1)$，则A的阴影值
   $$
    Shadow(A)=\left\{
    \begin{aligned}
        0\quad,&\quad \text{如果 } y_A<y_B \\
        1\quad,&\quad \text{如果 } y_A=y_B \\
        2\quad,&\quad \text{如果 } y_A>y_B
    \end{aligned}
    \right.
   $$

   在所有基色中，水（12）是最特殊的。**水的阴影值与相对高度无关，只由水深决定。** 水深1格时阴影值为2；水深6格时阴影值为1；水深等于或超过11格时阴影值为0。

   若一个方块比它北侧的方块高，那么它会表现的更亮；（水越浅越亮），**这让地图可以展示出地势的高低起伏**。

   **需要注意，阴影是2位无符号整数，可以有4种取值，却只使用了前3个。剩下的那个阴影值3可以在地图上正常工作，但不可能在原版生存里获得。** 我很纳闷Mojang在想什么。

4. Base color 0 is a special one
   
   Greatly different to all base colors, 0 means air or unexplored. The raw color of base color 0 is  full-transparent, letting through the background color of map item. Many transparent blocks such as glass, nether portal, torches and so on belongs to base color 0. It's weird that redstone lamp also belongs to 0.

5. Why is scaled maps meaningless?

   According to map mechanism, **scaling a map do no help to promote resolution and color counts**, it's a waste of blocks and rooms.

<br>
<br>

## How do map art works?
1. 3D map art mechanism
   
   In 3D maps, blocks are organized to form a pixel art. Each block plays 2 roles: 
   - Displaying its base color
   - Determine the south side block's shadow.

   So you can see, the height of each block is not organized arbitrarily, but determined by map colors.

2. Flat map art mechanism
   
   If you restrict that all map colors in map can only be shadow 1 (shadow 2 for water), you make a flat map. Every blocks have same aptitude.

3. File-only map art mechanism
   
   Vanilla maps (3D and flat) make images shown by building blocks, that's the only way in vanilla survival. But if you don't attach importance to vanillaness, replacing map data files is acceptable. File-only map simply replace existing map data file(s) by generated file(s) to make your image displayed. **Only in this way can the third shadow be applied to map pixel arts.**

<br>
<br>


## What is height compression?
Height compression is a new technology to decrease the maximum height of a 3D map. Since large images often result to height over 256, it makes great sense. There're 2 compression methods: **lossless compression** and **lossy compression**.

1. Lossless compression
   
   Lossless compression compresses an map art with effect unchanged. It will try to sink some segments in 3d map art.

   Before compressing, SlopeCraft caculate each coloumn represently. In each coloumn, $\Delta H$ is caculated first and $H$ next. 

   $$
   \Delta H_i=\left\{
      \begin{aligned}
         Shadow_i-1\quad &,\quad \text{when }BaseColor_i\neq 0,12 \\
         0 \quad &,\quad \text{else}
      \end{aligned}
      \right.

      \\

   H_i=\sum_{j=0}^i \Delta H_j \\

   maxHeight=\max H
   $$

   In formula above, $\Delta H$ refers to height difference and $H$ refers to the actual height of each block. The formula has a little difference to source code, but the principle doesn't change.

   The formula restrict that height difference must be -1, 0 or 1, but such restriction isn't a must. For example, a shadow-2-block only requires its height difference to be a positive number, it don't have to be 1. This provides us a chance to compress the maximum height losslessly.

   Lossless compression also apply special process to water and air as their shadow values are unrelated to relative height. Although these special blocks increased the difficulty to compression, map with air or water will be compressed better.

   **Lossless compression can not ensure to deflate all maps down to 256, sometimes a column of map is even uncompressible.**

2. Lossy compression
   
   Obviously lossless compression doesn't solve the problem completely. To compress the maximum height down to any value, modifying map color of several pixel is acceptable. Lossy compression algorithm deflate the maximum height by changing some pixel slightly, minimizing the sum color difference.

   **Lossy compression is able to deflate most maps don to any maximum height.** Implemented on genetic algorithm, it behaves slightly randomly and relatively slow.

   Although it can deflate down to any maximum height theoretically, **it's not recommended to set the maximun allowed height less than 14**, otherwise my genetic algorithm will spend a long long time to compress -- or even fail.

   **Long may the GENETIC ALGORITHM!**

Notice that 2 methods above are parallel, which means that **you can compress with both methods, or with single method**. If you enabled lossy compression, it's a good choice to enable lossless compression, it will make lossy compression **do less harm to the final map art quality**.

<br>
<br>

## Glass Bridge in 3D map

If you slice a 3d map horizontally, you will see many separate blocks on the cross-section. Such strcuture is really hard to build in vanilla survial, even with the help of litematica mod. If we connect these separate blocks, it will be easier to build. 

Glass bridge is the connection. Using prim algorithm, SlopeCraft connects all blocks in a layer with minmum amount of glass blocks. Usually, glass bridges aren't constructed in every layer, otherwise it's a waste of glass blocks. Since prim algorithm has a time complexity of $O(n^3)$, it is a time-consuming process in building 3d structure. However, comparing to the time of building it in vanilla survival, it saves time actually.