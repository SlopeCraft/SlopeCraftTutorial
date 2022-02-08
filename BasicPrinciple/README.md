# 地图画原理

<br>

这篇文章将会仔细介绍地图画工作原理，包括立体地图画、平板地图画和纯文件地图画。SlopeCraft正是基于这些机制开发出来的。通过研究并利用这些机制，人们可以让地图显示出自定义的图像。

## 为什么用地图？
Minecraft地图画可以分为两类：视觉型和地图型。视觉型地图画顾名思义，是建造出来直接用眼睛看的，它们可以是水平平板，也可以是垂直墙面。视觉型地图画简单直接，但往往体积巨大，不是很方便观看。然而地图可以放进物品展示框里，显示在地板或者墙上。多张地图甚至可以拼成一张更大的画面。这就是地图的优势。

在视觉型地图画中，方块直接显示它们材质贴图的颜色，每个方块都是不一样的。但地图型地图画并非如此。地图显示的颜色与方块的材质贴图可能有细微差别，很多方块拥有完全一样的颜色，比如雪块和白色混凝土。此外，对于绝大多数方块，地图显示的颜色和眼睛看到的颜色都会有细微但可察觉的差异，这导致很多视觉型的地图画在地图上表现的不太好。所以第一件事情就是弄明白Minecraft地图的机制。

<br>
<br>

## 地图如何显示方块？
**每个地图的分辨率都是 128 × 128 像素，与缩放尺度无关。** 地图对应的区域由缩放尺度scale决定，scale是一个整数，取值范围在0到4之间（包含0和4）。地图对应的区域是正方形，长宽均为
$128\times 2^{Scale}$
。当scale为0时，地图对应着128 × 128范围的方块，其中每个像素都代表一个方块；否则每个像素代表
$2^{Scale}$
个方块。scale大于0的地图对地图画而言没有意义，我不会再讨论它们，不过下文会告诉你为什么它们没有意义。

为了让地图更容易拼接，每个地图都会与一个网格自动对齐。地图起始坐标（西北角）为
$(128\times 2^{Scale}-64,y,128\times 2^{Scale}-64)$
。

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
   
   这决定了每个像素最多可能有256种颜色，每个值对应着不同的颜色。**这个8位无符号整数称为地图色。** 我们可以说地图是一个颜色表固定的8位索引图像。

3. 基色（BaseColor）与阴影（Shadow）
   
   如上文所述，地图色是8位无符号整数。它的高6位形成了6位无符号整数，称之为基色（BaseColor)，余下2位形成了2位无符号整数，称为阴影。地图色、基色和阴影的关系如下：

   $$地图色=4\times 基色+阴影$$ 
   
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

   阴影有什么意义？阴影表示一个方块与周边方块的相对高度。如果方块A的坐标为
   $(x,y_A,z)$
   ，它北侧方块B的坐标
   $(x,y_B,z-1)$
   ，则A的阴影值

   $$Shadow(A)=\left\{
    \begin{aligned}
        0\quad,&\quad \text{如果 } y_A<y_B \\
        1\quad,&\quad \text{如果 } y_A=y_B \\
        2\quad,&\quad \text{如果 } y_A>y_B
    \end{aligned}
    \right.$$

   在所有基色中，水（12）是最特殊的。**水的阴影值与相对高度无关，只由水深决定。** 水深1格时阴影值为2；水深6格时阴影值为1；水深等于或超过11格时阴影值为0。

   若一个方块比它北侧的方块高，那么它会表现的更亮；（水越浅越亮），**这让地图可以展示出地势的高低起伏**。

   **需要注意，阴影是2位无符号整数，可以有4种取值，却只使用了前3个。剩下的那个阴影值3可以在地图上正常工作，但不可能在原版生存里获得。** 我很纳闷Mojang在想什么。

4. 0也是个特殊的基色
   
   基色0代表**空气**或者**未探索**，与其他所有基色都截然不同。基色0对应的颜色是全透明，看到的只有地图物品的背景色（或物品展示框的材质）。很多透明方块都属于基色0，如玻璃、下界门、火把等。很奇怪的是，红石灯也属于基色0。

5. 为什么说缩放地图是没有意义的？

   根据地图机制，缩放地图既不能提高地图分辨率，也不能带来更多颜色。所以按缩放后的尺寸建造更大的地图画，纯粹是浪费方块、浪费空间。

<br>
<br>

## 地图画工作原理
1. 立体地图画机制
   
   立体地图画中，方块按照特定位置放置，形成立体地图画。每个方块都有两个作用：
   - 显示本身的基色
   - 决定南侧方块的阴影

   可见，每个方块的高度不是胡来的，而是地图色决定的。

2. 平板地图画机制
   
   如果你限定地图画只能由阴影为1的基色组成（或阴影为2的水），你就得到了平板地图画。每个方块都有相同的高度。

3. 纯文件地图画机制
   
   原版地图画（立体和平板）都是先建造，再用地图记录，这也的确是原版生存中唯一的办法。但如果你不要求这么香草，直接替换地图数据文件也是不错的选择。纯文件地图画直接把地图数据文件放进存档里，或者用生成的替换现有的地图数据文件，然后再用命令获得对应的地图物品。**这是使用第三种阴影的唯一方法。**

<br>
<br>


## 什么是高度压缩
高度压缩是一种新技术，可以降低立体地图画的最大高度。鉴于大尺寸地图画很容易超过限高，压缩是很有意义的。目前压缩有两种方式：**无损压缩**和**有损压缩**。

1. 无损压缩
   
   无损压缩保持地图显示效果完全不变。它尝试将地图的某些片段下沉。

   压缩时，SlopeCraft依次独立处理地图画的每一列。

   $$\Delta H_i=\left\{
      \begin{aligned}
         Shadow_i-1\quad &,\quad \text{如果 }BaseColor_i\neq 0,12 \\
         0 \quad &,\quad \text{其他情况}
      \end{aligned}
      \right.

      \\

   H_i=\sum_{j=0}^i \Delta H_j \\

   maxHeight=\max H$$

   上式中，
   $\Delta H$
   是每个方块与自己北侧方块的高度差，
   $H$
   是每个方块的高度。这个公式与实际源代码略有差别，但基本原理一致。

   上面的公式限定了高度差必须为-1，0或者1，但这种限制不是必须的。例如，阴影2的方块只要求自己与北侧方块的高度差大于0，但不一定是1。这就提供了无损压缩的机会。

   无损压缩还会特殊处理水和空气方块，因为它们的阴影值与高度差无关。虽然这让代码实现难度高了不少，但压缩效果会更好。

   **请注意，无损压缩不能绝对保证把高度压缩到256以内。有时候地图画的一列甚至可能是单调递增/递减，根本就不可压缩。** 

2. 有损压缩
   
   显然，无损压缩没有彻底解决问题。为了把地图画总高度压缩到任何值以内，微调一些像素的颜色也是可以接受的。有损压缩算法会细微调整一些像素的地图色来压缩总高度，并保证色差尽量小。

   **有损压缩可以把地图画压缩到任何高度以内。** 介于是用遗传算法实现，有损压缩的表现有些随机，且相对缓慢。

   尽管理论上可以把总高度压缩到任意值，但我**不建议你把最大允许高度设为小于14的值**，否则遗传算法需要相当长长长长长的时间来压缩————甚至可能压缩失败。

   **遗传算法，永远滴神！**

值得一提的是，上述两种方法是平行的，你可以同时使用两种压缩算法，也可以只使用一种。如果你已经启用了有损压缩，建议顺手勾上无损压缩，这可以降低有损压缩对画质的损伤。

<br>
<br>

## 立体地图画中的玻璃桥

取立体地图画任一水平切面，不难发现，切面上有很多孤立的方块。这种结构真的很难在原版生存建造，即便有投影mod辅助也是如此。**但如果我们将这些孤立的方块连接起来，就比较容易建造了。**

玻璃桥就是这个“连接”。使用Prim算法可以用最少的玻璃把一层内所有方块都连接起来，这个过程就叫搭桥。通常来说不是每个层都要搭桥，否则会浪费很多玻璃。默认间隔4层，即每5层搭一次桥。

考虑到Prim算法的时间复杂度为
$O(n^3)$
，这会耗费些时间。不过比起建造的肝度，实际上还是节省时间的。