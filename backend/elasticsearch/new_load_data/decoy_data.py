# Copyright (C) Heng Ye - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential
# Written by Heng Ye <leonyhenn@gmail.com>, July 2019
from copy import deepcopy
import json
import requests

LATITUDE = 43.667898; 
LONGITUDE = -79.429443;
SPACE = 0.01;

decoy_coor_0 = {"latitude":LATITUDE ,"longitude":LONGITUDE}
decoy_coor_1 = {"latitude":LATITUDE + SPACE,"longitude":LONGITUDE + SPACE}
decoy_coor_2 = {"latitude":LATITUDE + SPACE * 1.5,"longitude":LONGITUDE + SPACE * 1.5}
decoy_coor_3 = {"latitude":LATITUDE + SPACE * 2.0,"longitude":LONGITUDE + SPACE * 2}
decoy_coor_4 = {"latitude":LATITUDE + SPACE * 2.5,"longitude":LONGITUDE + SPACE * 2.5}
decoy_coor_5 = {"latitude":LATITUDE + SPACE * 3.0,"longitude":LONGITUDE + SPACE * 3}
decoy_coor_6 = {"latitude":LATITUDE + SPACE * 3.5,"longitude":LONGITUDE + SPACE * 3.5}
decoy_coor_7 = {"latitude":LATITUDE + SPACE * 4.0,"longitude":LONGITUDE + SPACE * 4}
decoy_coor_8 = {"latitude":LATITUDE + SPACE * 4.5,"longitude":LONGITUDE + SPACE * 4.5}
decoy_coor_9 = {"latitude":LATITUDE + SPACE * 5.0,"longitude":LONGITUDE + SPACE * 5}
decoy_coor_10 = {"latitude":LATITUDE + SPACE * 5.5,"longitude":LONGITUDE + SPACE * 5.5}
decoy_coor_11 = {"latitude":LATITUDE + SPACE * 6.0,"longitude":LONGITUDE + SPACE * 6}
decoy_coor_12 = {"latitude":LATITUDE + SPACE * 6.5,"longitude":LONGITUDE + SPACE * 6.5}
decoy_coor_13 = {"latitude":LATITUDE + SPACE * 7.0,"longitude":LONGITUDE + SPACE * 7}
decoy_coor_14 = {"latitude":LATITUDE + SPACE * 7.5,"longitude":LONGITUDE + SPACE * 7.5}
decoy_coor_15 = {"latitude":LATITUDE + SPACE * 8.0,"longitude":LONGITUDE + SPACE * 8}
decoy_coor_16 = {"latitude":LATITUDE + SPACE * 8.5,"longitude":LONGITUDE + SPACE * 8.5}
decoy_coor_17 = {"latitude":LATITUDE + SPACE * 9.0,"longitude":LONGITUDE + SPACE * 9}
decoy_coor_18 = {"latitude":LATITUDE + SPACE * 9.5,"longitude":LONGITUDE + SPACE * 9.5}
decoy_coor_19 = {"latitude":LATITUDE + SPACE * 10.0,"longitude":LONGITUDE + SPACE * 10}
decoy_coor_20 = {"latitude":LATITUDE + SPACE * 10.5,"longitude":LONGITUDE + SPACE * 10.5}
decoy_coor_21 = {"latitude":LATITUDE + SPACE * 0.5,"longitude":LONGITUDE + SPACE * 0.5}
decoy_coor_22 = {"latitude":LATITUDE + SPACE * 11.0,"longitude":LONGITUDE + SPACE * 11.0}
roast1 = {       
      "roast":{
        "tags":["z","作死"],
        "content":[{"type":"vote","options":["选项1","选项2","选项3","选项4"],"counts":[89,8,50,75],"colors":["#ffcccc","#9dfbbc","#cc99cc","#abcdef"]},
                  # {"type":"location","latitude":decoy_coor_0["latitude"],"longitude":decoy_coor_0["longitude"]},
                   
                   
                   {"type":"text/plain","filename":"​首先给没有看过的帖子的JRS一个传送门。"},
                   {"type":"text/plain","filename":"​如下是给我同事的聊天记录。先介绍下前情故事。"},
                   {"type":"text/plain","filename":"​此女通过一次社交活动认识一男的，在互加微信后聊天一段时间，发现聊得不错。中途男生主动约女的出来玩，女的均委婉拒绝"},
                   {"type":"text/plain","filename":"​后续男的某次约女的晚上去他家吃饭，女的可能在聊了一段时间后可以尝试见面，便答应前往"},
                   {"type":"text/plain","filename":"​结果在下班后，男的没有开车来接她。自己觉得打车过去挺麻烦，便又借故没去"},
                   {"type":"text/plain","filename":"​结果后面男的就没有再联系他了，女方主动联系也回复得不是很及时。"},
                   {"type":"text/plain","filename":"​一段时间后，她来和我谈起这个事情，我本着劝和不劝分的原则，要她主动和男方联系一下解释一下上次的事情，或者是给个善意的谎言给对方一个台阶下，觉得事情可能有所余地"},
                   {"type":"text/plain","filename":"​可女方只愿意和男方闲聊，丝毫不觉得她有任何做错的地方"},
                   {"type":"text/plain","filename":"​今天看到这个帖子后，果断转给她看了后"}],
        "title":"给我一个女同事看了隔壁那个作女作死的帖子后。（结局引起极度不舒适)"
      }
    }
roast2 = {
      "roast":{
        "tags":["极度舒适","婚恋市场","找不到女朋友","负面榜样"],
        "content":[
                  {"type":"location","latitude":decoy_coor_1["latitude"],"longitude":decoy_coor_1["longitude"]},
                   {"type":"vote","options":["选项1","选项2","选项3","选项4"],"counts":[89,8,50,75],"colors":["#ffcccc","#9dfbbc","#cc99cc","#abcdef"]},
                   
                   {"type":"text/plain","filename":"​先说结论：婚恋市场真的会出现让你们大跌眼镜的情况，比如在街上看来的三分女农村家庭嫁了一个各方面都不错的男的。"},
                   {"type":"text/plain","filename":"​论据不用“我朋友”了，就说我吧：坐标上海，身高180CM，颜值基本路人。学历方面，某个211本科，正在想去考个研究生。经济方面，无车无房，年薪60+吧。性格方面，三观、待人接物、沟通能力、兴趣爱好这些都没什么问题，工作多年跟周围的同事朋友全部相处愉快。除了抽烟也没什么不良嗜好。家庭方面，没什么助力，但也没什么阻力。这种条件，能否达到BXJ“条件还凑合”的男性标准呢？"},
                   {"type":"text/plain","filename":"​好了，下面是重点了 找不到女朋友！找不到女朋友！找不到女朋友！原因？我也不知道，自我检讨了一下，大概是已经一年多两年没认识过新的“未婚单身妹子”了，这很抓狂。平常工作忙也没什么时间到处溜达。但真的，可能BXJ的大伙年龄不大感受不深，但像我这种30左右的，可能一不留神，身边就再没合适的对象了。虽然一个人过得也挺舒服的，但看到身边朋友纷纷开始晒娃，父母也催得越来越急，有时候也在想要不随便找个人娶了算了？如果以这种状态去相亲，是不会考虑类似于“女方学历如何收入如何家庭如何”之类的，也就是看着顺眼，对方对我不排斥，快速就娶了。为什么不呢？有时候可能相亲的时间都不充裕，仅此而已…"},
                   {"type":"text/plain","filename":"​所以啊，25左右的兄弟们 珍惜这种“环顾四周到处都是可撩妹子”的时光吧 看看我，负面榜样"}],
        "title":"看隔壁的找对象要求，感叹街上的同学可能有些事不知道（内容引起极度舒适）"
      }
    }
roast3 = {
  "roast":{
    "tags":["七夕","礼物","吵架","分手","女朋友"],
    "content":[{"type":"vote","options":["选项1","选项2","选项3","选项4"],"counts":[89,8,50,75],"colors":["#ffcccc","#9dfbbc","#cc99cc","#abcdef"]},
              {"type":"location","latitude":decoy_coor_2["latitude"],"longitude":decoy_coor_2["longitude"]},
               
               
               {"type":"text/plain","filename":"​前天晚上下班回家，女朋友说七夕买的礼物到了，我挺开心的。表示了很开心，和感谢。准备提一局fifa然后说了晚上带他去看电影。打算回来慢慢拆，慢慢欣赏。结果她就开始不高兴了，作为一个直男，一开始真没意识到。后来觉得不对劲，就去问问。重点是一开始态度极好，本着有错就改，误会我的话加以注意的原则沟通。"},
               {"type":"text/plain","filename":"​哄了两个小时，人家一言不发，玩手机，看书。后来心态崩了，让她把书放下，好好沟通一波。"},
               {"type":"text/plain","filename":"​上手把她书抢下来了，我不是脾气暴躁啊，哄了十几次，两个多小时后才爆发的。后来她要回宿舍，楼主女朋友在校读研，还没毕业。"},
               {"type":"text/plain","filename":"非要自几打车回去，想想最近发生的事情 大晚上我也不敢让她自己回去啊。就开车把她送回学校了，心想冷静下来再当面哄，昨晚在她学校楼下两个多小时，不见，不接。今天发来截图。果断删微信，删电话，心态崩了。"},
               {"type":"text/plain","filename":"​吐出来轻松多了"}],
    "title":"内容绝对舒适 一口老血"
  }
}
roast4 = {
  "roast":{
    "tags":["舔狗","前女友","极度舒适"],
    "content":[
              {"type":"location","latitude":decoy_coor_3["latitude"],"longitude":decoy_coor_3["longitude"]},
               {"type":"vote","options":["选项1","选项2","选项3","选项4"],"counts":[89,8,50,75],"colors":["#ffcccc","#9dfbbc","#cc99cc","#abcdef"]},
               
               {"type":"text/plain","filename":"​我是跟她闺密先认识的，然后她闺密介绍的。。。追的时候她闺密就帮了我很多。"},
               {"type":"text/plain","filename":"​对，确实是因为跟她呆在一起绝望了。。只是刚好这张截图成了导火索，加快了这个进程。其实我想要的很简单，每天能有时间能陪陪我聊聊天，人就算上班也不可能24小时，能抽空跟我说两句话就好，我不需要她给我付出什么其他东西。。。很难受，从平常的聊天中就能感受到，我喜欢上了一个我爱她胜过她爱我的人，而且最起码我爱她比他她爱我超过十倍 "},
               {"type":"text/plain","filename":"​浙江的都喜欢把 "},
               {"type":"text/plain","filename":"​嗯，跟我想的一模一样。我也是准备用其他事情来转移目标 "},
               {"type":"text/plain","filename":"​我先认识她闺蜜，然后她闺蜜介绍的她。。。她跟她闺蜜认识七八年了 "}],
    "title":"内容极度舒适。舔狗当够了"   
  }
}
roast5 = {
  "roast":{
    "tags":["前女友","极度舒适","渣男"],
    "content":[{"type":"vote","options":["选项1","选项2","选项3","选项4"],"counts":[89,8,50,75],"colors":["#ffcccc","#9dfbbc","#cc99cc","#abcdef"]},
              {"type":"location","latitude":decoy_coor_4["latitude"],"longitude":decoy_coor_4["longitude"]},
               
               
               {"type":"text/plain","filename":"​事情是这样的，lz家最近装修，今天骑车送给我家装修的一个阿姨回家拿工具，本来开心的以为可以秀一下车技，结果快到他家的时候才发现，他家就在我前女友家旁边。也是我嘴贱，说这旁边有几个同学还是我一届的，然后就提到了我前女友（简称X吧），她跟我说X之前跟她们班的一个同学谈恋爱，耽误了学习，后来那个男的考上了一本，而X自己却只考了个三本，然后那个男的嫌弃X学历没有自己高，高考之后就突然不理她了，我当然知道他说的是谁，可是，事情不是这样的啊。事实是，我和前女友初中谈恋爱，确实有点早哈，然后高中不在一个学校，高一的时候还挺好的，可是高二的时候我的一个同学跟我讲她把我绿了，我刚开始不信，后来证实了，确实是这样，我当时也没说什么，只是没理他，把她删了。就此大路朝天，各走一边。"},
               {"type":"text/plain","filename":"​后来，大二的时候，她大一，她复习了一年，有一天她突然找我，聊了两句发现她的诚实竟然就在我的城市旁边，然后她突然跟我说让我做她男朋友，我。，。。我说 你是在玩大冒险吗   她说不是   然后我就没理他了   不得不说，我真的不会在回头喜欢她了，况且当时我和我现女友都快成了。OK 我现在有女朋友，而且很相爱。"},
               {"type":"text/plain","filename":"​所以说到这，家人们，你们怎么看。"},
               {"type":"text/plain","filename":"​我现在心情很复杂，为什么我就变成了一个彻彻底底的渣男了"},
               {"type":"text/plain","filename":"​福利就算了吧，心情很不好。家人们见谅。 "}],
    
    "title":"关于前女友的事情，内容引起极度舒适"
  }
}
roast6 = {
  "roast":{
    "tags":["宿舍","结婚","老好人"],
    "content":[
              {"type":"location","latitude":decoy_coor_5["latitude"],"longitude":decoy_coor_5["longitude"]},
               {"type":"vote","options":["选项1","选项2","选项3","选项4"],"counts":[89,8,50,75],"colors":["#ffcccc","#9dfbbc","#cc99cc","#abcdef"]},
               
               {"type":"text/plain","filename":"我大学宿舍老三下一周结婚，所以我今天问老三怎么安排，想今天把事定下来，这样我们宿舍当伴郎的就准备衣服，离家远的提前买票。"},
               {"type":"text/plain","filename":"然后老三让我跟老四老五当伴郎，我把这事告诉老四老五的时候，一个说工作忙，去不去定不下来，所以不一定能当伴郎，还让我告诉老三。（我就有点火，）另一个之前说没皮鞋，我给他准备皮鞋了。他今天告诉我衣服可能穿不了（可能是跟我开玩笑，但我当真了，就怒了）。我就觉得一个个的有问题找新郎说清楚啊，我这好心问你们也是提醒你们啊。直接把我当中转站了。"},
               {"type":"text/plain","filename":"我跟宿舍每个人关系都很好，我也把他们当亲兄弟似的，我就觉得，结婚这么大的事当哥哥的不就该操心嘛。我跟老四牢骚了几句，他说我自己找事，瞎操心。。。。。。"},
               {"type":"text/plain","filename":"我就觉得我有点傻，尽做些费力不讨好的事。"},
               {"type":"text/plain","filename":"之前有次实习的时候我管着几个小弟弟小妹妹，我都是做我自己的工作也帮着他们做，想着让他们少受累。还有领导让我们加班，他们10点走的我拖到11点多，就想早点做完工作让领导好交差"}],
    
    "title":"我这是不是有点傻？废话太多，可能引起不舒适"
  }
}
roast7 = {
  "roast":{
    "tags":["舔狗","分手","初恋"],
    "content":[{"type":"vote","options":["选项1","选项2","选项3","选项4"],"counts":[89,8,50,75],"colors":["#ffcccc","#9dfbbc","#cc99cc","#abcdef"]},
              {"type":"location","latitude":decoy_coor_6["latitude"],"longitude":decoy_coor_6["longitude"]},
               
               
               {"type":"text/plain","filename":"  小弟准大三，这是发生在我身上最荒诞的事，小弟父母早逝，一个人生活了7年了吧，她早年和奶奶一起住，初三以前没见过父母，成绩很好，和她同村，她高三以前无任何接触。"},
               {"type":"text/plain","filename":"她高三快毕业的时候互有好感，追了她半年，大学在同一个城市，去年11.12号在一起了。她不是我初恋，她也一样，但是她所有的第一次都给我了，感情一直很好，我属于那种自我保护意识强的人，不会轻易喜欢一个人，和她在一起很踏实，我会睡得很好，笑得更开心，只有在她面前，我才会毫无伪装，她在别人面前乖乖女，在我面前才是最真实的她。一直相安无事，"},
               {"type":"text/plain","filename":"去年寒假，楼主搞劳务这块，她一直想和我去，我劝她不要去，因为厂区很难呆，她比较倔强，后面我妥协了，一切安排好了，结果临出发那晚她告诉我说，她家人让她回家，第一次发现她自主意识弱，后面楼主去了深圳，她回老家。异地免不了吵闹，期间发生一件让我一直难受的事，她前男友借朋友微信找她，问她给她100万愿不愿意和他在一起（农村社会青年，早婚早育）后面她拒绝了，我回来以后发现她微信里保存对方照片，那时候和她在一起3个月了吧，她手机里关于我的照片一张没有，吵了一架。她认为我不信任她，可我生气的原因在她为什么不告诉我？"},
               {"type":"text/plain","filename":"后面她给了我一耳光，这事就过去了，跌跌撞撞到了今年6月，楼主创业中，边上课边工作，压力巨大，对她陪伴也少了，后面她怀孕了。戴套了，可还是怀上了，确定无疑是我的，我就是渣男吧，从那一刻开始，当时感觉天要塌了，可我只能尽量去弥补她了，征求她的意见，选择不要，医生说怀的位置不好，这个孩子不属于我们，做手术那天，我从拿药到她下手术台一直在哭，我爸妈走以后第一次哭，我多想替她分担痛苦，看着她憔悴的模样，我想用我的后半生让她成为这世界上最幸福的女人。"},
               {"type":"text/plain","filename":"今年暑假，她回老家，楼主去县城做项目，很想她，然后希望她能来看看我，从她一回家，她父母一直询问她和我是否在一起，村里的议论也是层出不穷。给了她很大压力，我也给她压力，然后她选择逃避，和异性好友开小号打游戏。我发现她回我QQ速度很慢，甚至隔了半小时，她游戏也没在线，就无意发现她开小号和一个男的开黑。那兄弟我认识，但是没好友，当时以为我被绿了，瞬间爆炸了，一晚上没睡着，疯狂打她电话，第二天她回我电话了，问她那男的是谁她不说，我提了分手她才开始解释。晚上和朋友喝酒，喝到烂醉，同意不分手，她当时说了一句。下次再提分手就知道分了，当时烂醉如泥，完全没有意识到，第二天她说要来看我，我超级开心。"},
               {"type":"text/plain","filename":"那天把她QQ和我的关联了，第二天问她多久来，（确实很想她）她说下午，后面又说她爸不让她来，那男生发消息给她，我就说了一句你朋友发消息给你了，她爆炸了，一直争吵，楼主又提了分手，她很爽快的答应了，可能是我不够成熟吧，想用通过闹分手让她来见我，她爽快答应，楼主就发现事情不多，开始跪舔。从7月底一直舔到8月10号，她说她有男朋友了。楼主把她QQ盗了，真的有男朋友了，分手后打游戏认识的，一个四川的富二代，没读书，19岁，比楼主帅，很会撩妹。。感觉天都塌了，"},
               {"type":"text/plain","filename":"那晚上像疯子一样在街上逛，流着泪，喊着她的名字，分手开始就一直在哄她，纠缠她，礼物，通宵做的相册，她通通不要，最后自杀威胁，也没用，回老家找她，她不愿意见面，后面和高中兄弟喝酒，喝多了忍不住哭了，把他们吓到了。他们从来没见过我哭过。一直问我关于她的事，后面他们把那男的闹跑了。"},
               {"type":"text/plain","filename":"9月3号，分手后纠缠了一个多月吧，一个月瘦了8斤，工作不在状态，丢了魂一样。抑郁症爆发，一天天嗑药过日子，每天梦里是她，身边的所有事物都会想起她，3号那天一盒安眠药，两罐啤酒。吃完给我最好的女性朋友发了条短信，她也认识，后面我那朋友报警，她联系和我一起创业的兄弟，没死成。医生一顿操作后，警察叔叔一顿教育，辅导员推荐我去当兵。"},
               {"type":"text/plain","filename":"现在回老家等通知体检，小白，我不欠你的了，也不会再爱你了，其实你的电脑4800，我只告诉你4300，其实你生日给你的脚链是铂金的，不是银的，其实给你买的手机2800，我只告诉你2000，其实今年双十一的旅游计划都做好了，其实我未来的规划与梦都是你，其实你现在不知道堕胎对女孩一生影响多大，"},
               {"type":"text/plain","filename":"你想要的只是一个陪你打游戏，刷抖音，长得帅的男朋友吧，我毫无保留的把全部都给你，只是没有你想要的，以后你幸福，虽然与我无关。"}],
    
    "title":"一只自杀未遂的舔狗的故事，内容极度舒适"
  }
}
roast8 = {
  "roast":{
    "tags":["喜欢","篮球鞋","平头哥"],
    "content":[
              {"type":"location","latitude":decoy_coor_7["latitude"],"longitude":decoy_coor_7["longitude"]},
               {"type":"vote","options":["选项1","选项2","选项3","选项4"],"counts":[89,8,50,75],"colors":["#ffcccc","#9dfbbc","#cc99cc","#abcdef"]},
               
               {"type":"text/plain","filename":"Rt...我可能错过了一个爱自己的人，真的惭愧。首先说清楚，我可能逻辑不清了，打的很乱，因为现在已经接近崩溃。。。开学初8月份重新分班遇到个不错的妹子，她在班上经常找我聊，起初我没感觉啥，后来慢慢对她有感觉了。就想着:现在颜值又不如初中，痘又重新炸了回来，这人居然还能对自己有点意思。我虽然是个菜鸟，不怎么会撩妹，但这次却莫名自信，然后就顺着自己所想来做。"},
               {"type":"text/plain","filename":"就迅速发展起来了，记得有次——她让我带手机去，然后晚修下课时过我座位(我旁边座位空给来的复读生的)坐着下班上要放的励志歌曲，碍于尴尬和兄弟在外面等着，我走了出去直到上课才回去...期间就聊了十句话吧。然后有次励志歌的时候...可能因为我在看着书妹唱吧，她大声喊:xxx你别唱，干嘛不唱?我就是不让你唱。不唱就不唱......还有次上厕所拐角遇到她，她说了句——怎么每次都遇到你。在她朋友圈看过:kun是爱人没错了(我的字)，然后:早安循环附上我歌单列表第一首歌，她以前问过我是不是喜欢这首歌。"},
               {"type":"text/plain","filename":"然后就互相了解，聊了很多，也会常发语音过来。她总会问我健身，篮球，电脑这些东西，微信上班里面都是如此，这些都是我很喜欢的。还叫有什么烦心事和她多说说。而且平时关于爸妈啊，日常啊，朋友啊，经历啊什么的等等等等都聊过。提醒我上课别老钓鱼，然后数学多去问别人啊。"},
               {"type":"text/plain","filename":"我转住宿期间，校卡没完善好，她主动提出帮我买早餐，我碍于尴尬，只让她帮了我两次，我说不能麻烦你。前段时间搬宿舍，也说帮我买晚餐，我后来在学校吃了，她一下课就跑过来问我吃饱没，有没有骗她?当时老师都还在讲台。。。。。"},
               {"type":"text/plain","filename":"后来聊天中她无意中提到了想买篮球鞋，说但是腿短，我悄无声息的买了双女篮球，生日时附上特殊的祝语送她......她那天在走廊和我说:你买那么贵的干嘛......等你生日我要送回一双给你。在我送她这个之前她对我就已经特别好了。。。。。。"},
               {"type":"text/plain","filename":"然后看到她问他同桌(已经是一两个学期的同学了)数学啥的，他同桌又整天找她说话，我有点吃醋，后来聊的越来越好...那天她叫我去打排球时他们两个针锋相对，情侣似的。。。他同桌和我同宿舍，平时在宿舍手机都不动，基本上也就课室里才有机会和她说话。真是佩服了，高实在是高。"},
               {"type":"text/plain","filename":"虽然平时聊是聊着，但发现班上她对我开始冷了。"},
               {"type":"text/plain","filename":"我颜值基础好点，比他高，但有痘，可他没痘啊。而且看着偏锐气一点。我比他体育好，但是他毕竟a班下来的学习基本上高我一个档次。主动性和撩妹技术我肯定不如他。"},
               {"type":"text/plain","filename":"这个时候恰好四年前喜欢的女神奇迹般的复读了，被我在半个月前就预测到了。。。差点就同桌了，当时隔壁平行b班比我们人多，分过来只能和我同桌。这时候他们好像往来已经更多。我真的一直觉得——喜欢人不可避免，我只想选择对我产生负面影响最小的，哪怕都是不成功。这里插一句——你最喜欢的人和喜欢你的人，倾向于前者没有错吧?"},
               {"type":"text/plain","filename":"我就在宿舍问舍友我该怎么选择?虽然我没说我现在喜欢的人的名字，单蛛丝马迹肯定被抓着了。因为我把自己塑造成一个不专情的人的形象，可能这就被情敌抓着了。那晚她连着给我发了很多个黑色笑脸表情，然后问我在课室自习的时候和我其他舍友说了什么?我说 他们问我xx(复读的学姐)。以前喜欢过她。"},
               {"type":"text/plain","filename":"接着，最近挺多女的在班上找我说话聊天啥的...然后有些人可能有点过了同学那种。。。。。搞得好像是我去招惹了别人一样。"},
               {"type":"text/plain","filename":"激动人心的时刻来了，这就是失败的前奏——她那天聊着聊着，说给我打预防针。"}],
    
    "title":"内容引起极度舒适，我比平头哥还要悲哀! "
  }
}
roast9 = {
  "roast":{
    "tags":["女朋友","自拍","同学聚会"],
    "content":[{"type":"vote","options":["选项1","选项2","选项3","选项4"],"counts":[89,8,50,75],"colors":["#ffcccc","#9dfbbc","#cc99cc","#abcdef"]},
              {"type":"location","latitude":decoy_coor_8["latitude"],"longitude":decoy_coor_8["longitude"]},
               
               
               {"type":"text/plain","filename":"和女朋友谈了快两年，感情一直挺好，虽然还没有见过双方父母，但是也在微信上加了好友，商量好今年过年见面。"},
               {"type":"text/plain","filename":"前两天高中同学聚会，也提前和她报备过了。当时她的态度就是有女的就不准去，不然就不放心我，后来和她好说歹说总算同意了。等到了聚会那天，见到了几个好几年没见的同学大家都很开心。有一个高中玩的最好的一个女同学这几年都没有联系过，然后就和她拍了三张自拍。当时我就想也不是用我手机拍的，我也没做出格的事，女朋友也不会知道。那天聚会我还怕女朋友不高兴，提前就走了。结果不知道怎么回事，今天她就搞到了那三张自拍，其中两张根本没有身体接触，有一张就肩膀靠在了一起。然后根本不给我解释的机会。说什么笑得这么开心，找人家过去吧。我就纳闷了，拍个照还得哭不成。完全不相信我，自己脑补了一出大戏，觉得同学聚会也是骗她的。究竟是我真的错了还是她太小心眼了？"}],
    
    "title":"我该怎么办，内容引起舒适。"
  }
}
roast10 = {
  "roast":{
    "tags":["媳妇","二手车","娘家"],
    "content":[
              {"type":"location","latitude":decoy_coor_9["latitude"],"longitude":decoy_coor_9["longitude"]},
               {"type":"vote","options":["选项1","选项2","选项3","选项4"],"counts":[89,8,50,75],"colors":["#ffcccc","#9dfbbc","#cc99cc","#abcdef"]},
               
               {"type":"text/plain","filename":"事情是这样的，由于工作原因第二天需要租车查勘（基层通信行业老哥都懂），打算借朋友的车用几天，他刚入手了一个二手车开车不是很熟悉在家放着，我说借两天朋友也同意了。从娘家吃饭回来的路上说不让借，各说各的理由。然后她说出事了人家还担责任呢，我直接对了一句，出嫩达那蛋，然后就生气了。到家路口我说把我送到那谁家门口吧，她就直接下车回家了，到家以后直接说收拾东西出去（让我去客厅睡），我当然不能忍了:凭啥出去，她就扭头直接回娘家了。"},
               {"type":"text/plain","filename":"我知道她是怕我自己开车还得开两个小时到地方怕路上不安全，但是我自己开过车，从17年过年拿到证到现在也开过10几次车吧，还单独上过高速。可她直接说出事了怎么怎么着，我就炸了。各位老哥老姐老阿姨们来说说我错了嘛"}],
    
    "title":"一句话钢的媳妇直接回娘家了，内容引起舒适"
  }
}
roast11 = {
  "roast":{
    "tags":["模特","800字","舒适"],
    "content":[{"type":"vote","options":["选项1","选项2","选项3","选项4"],"counts":[89,8,50,75],"colors":["#ffcccc","#9dfbbc","#cc99cc","#abcdef"]},
              {"type":"location","latitude":decoy_coor_10["latitude"],"longitude":decoy_coor_10["longitude"]},
               
               
               {"type":"text/plain","filename":"某社交软件上认识了一个模特，聊了几天，留了联系方式，约了几天没约出来。后来突然有次我开玩笑的说现在出来散步吧，她说她现在正好在外面逛街，就叫我一起去逛了。"},
               {"type":"text/plain","filename":"然后我就去了，陪她逛街，买衣服，中间我找机会牵了她手她似有似无的反抗了下也任由我牵着了。后来陪她去买鞋试鞋坐着的时候我搂她腰她也看了看没说什么。"},
               {"type":"text/plain","filename":"结果后面她居然去内衣店买内衣，我当时就不好意思了就放手在外面等她，她买完出来看着我笑了下，然后就一起又很自然牵手走了。"},
               {"type":"text/plain","filename":"路上她问我想不想去她家吃柚子，我说好，她就顺路买了两个柚子，然后我就到她家里面了。她先说一会儿一起吃晚饭吧，我也说好。然后她开始收拾买的东西，我准备帮她结果她让我坐着说我是客人。但是她住的是小户型，我找来找去发现只有三个地方可以坐，她床上，她书桌前的椅子，和刚进门和床有个隔断的沙发。我就只好坐在最外面的沙发了。"},
               {"type":"text/plain","filename":"她收拾完也过来坐着，但是我们就没有话题了，她就主动拿手机给我看好玩的视频，但是我看过，所以还是聊不起来，她就开了个电视我们两个就坐在门口的沙发看电视，还是互相没聊天，因为我不太会聊。另外她还说了句要不你多等会儿见下我姐吧，我说我见你姐怕尴尬。最后她就说要不你回去了吧，我就回家了。"}],
    
    "title":"我是不是错过了一个800字模特的机会，内容引起舒适"
  }
}
roast12 = {
  "roast":{
    "tags":["渣","青青草原","备胎"],
    "content":[
              {"type":"location","latitude":decoy_coor_11["latitude"],"longitude":decoy_coor_11["longitude"]},
               {"type":"vote","options":["选项1","选项2","选项3","选项4"],"counts":[89,8,50,75],"colors":["#ffcccc","#9dfbbc","#cc99cc","#abcdef"]},
               
               {"type":"text/plain","filename":"以下是楼主兄弟所发生的真人真事看看有没有吊大的出出招   以下的内容是楼主兄弟自己编辑的，可以说那个女生是个渣了，把所有人都当成备胎，我兄弟好好对她却发现青青草原顶在头上拿不下来。"},
               {"type":"text/plain","filename":"楼主兄弟男称a 大学本校谈了一个女c 在一起1个多月吧 后来有次吵架冷战了4 5天后来虽说变面没和好 但是依然说互相说情话 晚上该出去做一些羞羞的事 但让a当时好奇的是 为啥都这样了 c依旧说没和好 后来a通过c的朋友圈才知道有个周末晚上出去玩没回来 在下面评论的发现一个男人b "},
               {"type":"text/plain","filename":"原来是和他出去吃饭开房了 进入b的空间才知道原来b和c认得谈了5年了 大学在同一坐城市不同的学校 因为c复读了才可能分了一年吧 这下就真相大白了 c和a吵架冷战时候 偷偷找b复合好了 结果a又来哄她 c女架不住 只能两个男人一起搞平时和a男在本校搞 周末去找b男 后来知道真相的a男比较难受"},
               {"type":"text/plain","filename":"找了c 反而被羞辱不懂爱 爱就是包容 所以一气之下把当时开房的床照和c发给a的偷情日记一个个给b的大学同学看了 说b男被c女绿了 在c女的学校还找其他男人 过了一周b和c果然分了 不过让a比较烦的是 (可能a有阴影了 )不想再看到b和c在一起"},
               {"type":"text/plain","filename":"c和其他哪个男的在一起都无所谓 就是不想看到b和c在一起 所以想请教有没有大神能不能教一招更好的方法让b和c永远没法在一起 而且b和c家在一个县城 哪怕再偷偷偷情也不好意思 a现在只有b的高中小时候的朋友同学 只有老办法"}],
    
    "title":"这种女生很少见了，内容引起舒适！各位jr支支招啊"
  }
}
roast13 = {
  "roast":{
    "tags":["舒适","银行","理财"],
    "content":[{"type":"vote","options":["选项1","选项2","选项3","选项4"],"counts":[89,8,50,75],"colors":["#ffcccc","#9dfbbc","#cc99cc","#abcdef"]},
              {"type":"location","latitude":decoy_coor_12["latitude"],"longitude":decoy_coor_12["longitude"]},
               
               
               {"type":"text/plain","filename":"小弟是银行狗一枚，被领导安排到小微支行上班（没关系没办法）身兼数职，这天正上班一个妹子进来说要咨询理财，"},
               {"type":"text/plain","filename":"本着敬业的态度给妹子介绍了一下，科普了一下理财知识，重点来了，妹子说微信提现太慢，说她给我微信转钱，让我给她取现。"},
               {"type":"text/plain","filename":"我就问妹子你需要多少钱？没想到妹子直接问我你有多少钱？说实话我当时有点懵也怕是骗子，就说能给她五百，妹子说要个四百就够了。"},
               {"type":"text/plain","filename":"我拿二维码收款把钱给她之后，妹子眼看着要走临走说要加一下我的微信，以后方便咨询理财，没办法只能加了。"},
               {"type":"text/plain","filename":"最后最害怕的是她出门在自助设备上把钱又存了…各位老哥帮忙看看，这是不是新的骗术？但是银行全是监控，骗到银行来也太不明智了吧？求大家给分析分析"}],
    
    "title":"我竟然在上班时间被妹子要了微信怎么办？（内容引起舒适"
  }
}

roasts_list = [roast1,
               roast2,
               roast3,
               roast4,
               roast5,
               roast6,
               roast7,
               roast8,
               roast9,
               roast10,
               roast11,
               roast12,
               roast13]


article1 = {       
  "masker":{
        "alias":["公共知识分子","作家"],
        "tags":["性骚扰","摸大腿","饭局"],
        "content":[{"type":"vote","options":["选项1","选项2","选项3","选项4"],"counts":[89,8,50,75],"colors":["#ffcccc","#9dfbbc","#cc99cc","#abcdef"]},
                  {"type":"location","latitude":decoy_coor_13["latitude"],"longitude":decoy_coor_13["longitude"]},
                   
                   
                   {"type":"text/plain","filename":"章文刚刚给我发的微博私信。 ​"},
                   {"type":"image/jpeg","filename":"3e89803fly1ftta7v7qspj20v91vok00.jpg"},
                   {"type":"image/jpeg","filename":"cSL5-hftenia2454894.jpg"},
                   {"type":"image/jpeg","filename":"v2-cddb8219f91b4765fe74f3af96880ea7_hd.jpg"}],
        "name":"章文",
        "contacts":{"wechat":"somewechataccount","cellphone":"123456789","other_key":"instagram","other_value":"henqiang"}
    }
  }
article2 = {
  "masker":{
        "alias":["南京师范大学新闻学硕士"],
        "tags":["强奸","媒体人","时事评论员","公知","专栏作家","饭局后"],
        "content":[{"type":"vote","options":["选项1","选项2","选项3","选项4"],"counts":[89,8,50,75],"colors":["#ffcccc","#9dfbbc","#cc99cc","#abcdef"]},
                  {"type":"location","latitude":decoy_coor_14["latitude"],"longitude":decoy_coor_14["longitude"]},
                   
                   
                   {"type":"image/jpeg","filename":"Rbxi-hftenia2500242.png"},
                   {"type":"image/jpeg","filename":"gBKW-hftenia2519068.jpg"},
                   {"type":"image/jpeg","filename":"8721e49bly1ftlssuzty0j20ku112dk1.jpg"}],
        "name":"章文",
        "contacts":{"wechat":"somewechataccount","cellphone":"123456789","other_key":"instagram","other_value":"henqiang"}
  }
}
article3 = {
  "masker":{
    "tags":["移民","美国大使馆","性骚扰"],
    "content":[{"type":"vote","options":["选项1","选项2","选项3","选项4"],"counts":[89,8,50,75],"colors":["#ffcccc","#9dfbbc","#cc99cc","#abcdef"]},
              {"type":"location","latitude":decoy_coor_15["latitude"],"longitude":decoy_coor_15["longitude"]},
               
               
               {"type":"image/jpeg","filename":"595ad6fegy1ftqllvc47oj20ms8c0e81.jpg"},
               {"type":"image/jpeg","filename":"v2-27e4262cc267db567ab2fbccebf6d848_b.jpg"}],
    "alias":[],
    "name":"章文",
    "contacts":{"wechat":"somewechataccount","cellphone":"123456789","other_key":"instagram","other_value":"henqiang"}
  }
}
article4 = {
  "masker":{
    "tags":["性骚扰","白天约喝酒"],
    "content":[{"type":"vote","options":["选项1","选项2","选项3","选项4"],"counts":[89,8,50,75],"colors":["#ffcccc","#9dfbbc","#cc99cc","#abcdef"]},
              {"type":"location","latitude":decoy_coor_16["latitude"],"longitude":decoy_coor_16["longitude"]},
               
               
               {"type":"text/plain","filename":"刚刚看他打“荡妇牌”，说蒋方舟男友多，易小荷离过婚，试图污名化受害者，我王嫣芸离了两次婚了，做过人体模特，不穿衣服的照片到处都是，在他眼里应该算彻头彻尾的荡妇吧？那为什么还打了他？能解释一下吗？挨打的时候没想过为什么吗？"},
               {"type":"text/plain","filename":"刚刚看他打荡妇牌,说蒋方舟男友多,易小荷离过婚,试图污名化受害者,我王嫣芸离了两次婚了,做过人体模特,不穿衣服的照片到处都是,在他眼里应该算彻头彻尾的荡妇吧?那为什么还打了他?能解释一下吗?挨打的时候没想过为什么吗?"}],
    "alias":["章老师,章教授"],
    "name":"章文",
    "contacts":{"wechat":"somewechataccount","cellphone":"123456789","other_key":"instagram","other_value":"henqiang"}   
  }
}
article5 = {
  "masker":{
    "tags":["我是清白的","两情相悦"],
    "content":[{"type":"vote","options":["选项1","选项2","选项3","选项4"],"counts":[89,8,50,75],"colors":["#ffcccc","#9dfbbc","#cc99cc","#abcdef"]},
              {"type":"location","latitude":decoy_coor_17["latitude"],"longitude":decoy_coor_17["longitude"]},
               
               
               {"type":"image/jpeg","filename":"R67U-hftenia2449125.png"},
               {"type":"image/jpeg","filename":"v2-40389313b3b31f6cfee435bda0164ea8_hd.jpg"}],
    "alias":[],
    "name":"章文",
    "contacts":{"wechat":"somewechataccount","cellphone":"123456789","other_key":"instagram","other_value":"henqiang"}
  }
}


article6 = {       
  "masker":{
        "alias":["tyler"],
        "tags":["脚踏十条船","骗炮"],
        "content":[{"type":"vote","options":["选项1","选项2","选项3","选项4"],"counts":[89,8,50,75],"colors":["#ffcccc","#9dfbbc","#cc99cc","#abcdef"]},
                  {"type":"location","latitude":decoy_coor_18["latitude"],"longitude":decoy_coor_18["longitude"]},
                   
                   
                   {"type":"text/plain","filename":"首先是妹子A, 受害者们的大姐，和lyc从高三起相恋，大学起开始长达五年的异地恋。"},
                   {"type":"image/jpeg","filename":"6e52e980d7514082b736d6872265fa6b.jpeg"},
                   {"type":"text/plain","filename":"虽然lyc一直表现的很忙，不接电话不回短信是常态，但他一直表现的特别专一与真诚所以妹子对lyc并没有太多的怀疑。"},
                   {"type":"text/plain","filename":"据妹子A称，她一直把lyc当成未来结婚对象。"},
                   {"type":"text/plain","filename":"每次妹子不开心，lyc总是以“我现在那么忙都是为了我们的将来”蒙混过关。"},
                   {"type":"text/plain","filename":"直到18年年初，妹子A突袭lyc多伦多的家，发现lyc家中有大量的女性用品，才发现原来和自己相恋多年的男友居然在多伦多有个同居的妹子F。"},
                   {"type":"text/plain","filename":"刘宇辰，南京人，毕业于南外中加班，现在在加拿大，读了两年滑铁卢大学但因fail课太多被学校kickout，但演技高超的他凭借着惊人的演技，成功让所有人相信他转学去了多大，并神不知鬼不觉地博取了多大各学生会的信任成功加入多个社团。平日里衣冠楚楚的他不仅在滑铁卢是不少于50个人社团里的社长，在多大也混成了*灯塔／多大中文论坛的主席，100分演技的他还代表南外精英校友参加了2017南外加拿大校友峰会。拥有如此履历的高材生，又有怎样的背后一面？"}],
        "name":"刘宇辰",
        "contacts":{"wechat":"somewechataccount","cellphone":"123456789","other_key":"instagram","other_value":"henqiang"}
    }
  }
article7 = {       
  "masker":{
        "alias":["滑铁卢电台社长"],
        "tags":["滑铁卢大学","数学系","骗车"],
        "content":[{"type":"vote","options":["选项1","选项2","选项3","选项4"],"counts":[89,8,50,75],"colors":["#ffcccc","#9dfbbc","#cc99cc","#abcdef"]},
                  {"type":"location","latitude":decoy_coor_19["latitude"],"longitude":decoy_coor_19["longitude"]},
                   
                   
                   {"type":"text/plain","filename":"妹子B, lyc的大学同学。妹子B很快就被lyc的真诚打动并傻傻的每天给lyc洗衣做饭辅导功课。"},
                   {"type":"image/jpeg","filename":"2018022140922969.jpg"},
                   {"type":"text/plain","filename":"妹子B, lyc的大学同学。妹子B很快就被lyc的真诚打动并傻傻的每天给lyc洗衣做饭辅导功课。不仅如此，妹子B还帮lyc付了他第一辆奔驰的首付。lyc一直对外谎称这辆车是自己买的，直到他被滑铁卢kick out才把lease转还给妹子B."},
                   {"type":"text/plain","filename":"妹子C和妹子D, lyc在任滑铁卢电台社长认识的两妹子。两妹子都被lyc的才华和真诚所打动，竟在一个圈子里傻傻不知道彼此的存在"},
                   {"type":"text/plain","filename":"Lyc的套路是每次给人以希望之后又人间蒸发，当你质疑人生要崩溃时，他又会突然出现再次带来希望，重蹈覆撤。他会承诺给你未来，让你相信他的绝对忠诚。全套戏码，有过之而无不及。他高超的演技让交往过的妹子都觉得 “我和其他男人不一样，我对你很真诚”。lyc专挑涉世未深的单纯女孩下手，让其深陷其中，却不知摧残了多少年轻女生的爱情观。大部分受害者不仅浪费了宝贵的青春，还因为他毫无道德毫无底线的行径，深受失眠和抑郁症所扰。lyc确毫无悔意，自私自利缺德至极！"}],
        "name":"刘宇辰",
        "contacts":{"wechat":"somewechataccount","cellphone":"123456789","other_key":"instagram","other_value":"henqiang"}
    }
  }
article8 = {       
  "masker":{
        "alias":["多大中文论坛主席"],
        "tags":["南京外国语学校","真诚","穷追不舍","人间蒸发","不带套"],
        "content":[{"type":"vote","options":["选项1","选项2","选项3","选项4"],"counts":[89,8,50,75],"colors":["#ffcccc","#9dfbbc","#cc99cc","#abcdef"]},
                  {"type":"location","latitude":decoy_coor_20["latitude"],"longitude":decoy_coor_20["longitude"]},
                   
                   
                   {"type":"text/plain","filename":"妹子E，妹子高中时认识“大四”的lyc，被lyc的真诚与穷追不舍打动，很快同意lyc的追求。"},
                   {"type":"image/jpeg","filename":"w0rYCa_H_400x400.jpeg"},
                   {"type":"text/plain","filename":"在一起后的一个月，lyc本性毕露，电话短信不接，人间蒸发，声称自己太累太忙。偶尔来找妹子E，除了papapa没有其他事。"},
                   {"type":"text/plain","filename":"期间送了妹子E包为生日礼物，后因包坏去专柜修，被告知是假包。交往时不肯做防护措施，强迫妹子吃药。"}],
        "name":"刘宇辰",
        "contacts":{"wechat":"somewechataccount","cellphone":"123456789","other_key":"instagram","other_value":"henqiang"}
    }
  }
article9 = {       
  "masker":{
        "alias":["dingle park capital president"],
        "tags":["手表","借钱不还","约炮","三分钟","伪善"],
        "content":[{"type":"vote","options":["选项1","选项2","选项3","选项4"],"counts":[89,8,50,75],"colors":["#ffcccc","#9dfbbc","#cc99cc","#abcdef"]},
                  {"type":"location","latitude":decoy_coor_21["latitude"],"longitude":decoy_coor_21["longitude"]},
                   
                   
                   {"type":"text/plain","filename":"妹子F，和lyc在一起两年，与lyc同居过小半年，在妹子A来查岗时仍在同居。知道大部分lyc做的肮脏事，但被lyc威胁，不敢出声。同居后借给lyc几十w刀买房，赠予其手表等一系列物品。"},
                   {"type":"image/jpeg","filename":"Waterloo_Math_Logo.gif"},
                   {"type":"text/plain","filename":"妹子GH, lyc约炮认识, 据说他三分钟she但自我感觉良好。"},
                   {"type":"text/plain","filename":"妹子I, 和lyc工作认识，在一起一年，直到被告知都难以相信lyc的真实面目。据她描述，她所认识的lyc极度善良和纯粹，每天把“安得广厦千万间，大庇天下寒士俱欢颜”放在在嘴边。"}],
        "name":"刘宇辰",
        "contacts":{"wechat":"somewechataccount","cellphone":"123456789","other_key":"instagram","other_value":"henqiang"}
    }
  }
article10 = {       
  "masker":{
        "alias":["lyc"],
        "tags":["非法居留","软饭","玩弄感情","酒驾"],
        "content":[{"type":"vote","options":["选项1","选项2","选项3","选项4"],"counts":[89,8,50,75],"colors":["#ffcccc","#9dfbbc","#cc99cc","#abcdef"]},
                  {"type":"location","latitude":decoy_coor_22["latitude"],"longitude":decoy_coor_22["longitude"]},
                   
                   
                   {"type":"text/plain","filename":"妹子J, 和lyc朋友介绍认识。在一起短短几个月花费数万，给lyc买各式各样的衣物。"},
                   {"type":"image/jpeg","filename":"twitterlogo.png"},
                   {"type":"text/plain","filename":"妹子GH, lyc约炮认识, 据说他三分钟she但自我感觉良好。"},
                   {"type":"text/plain","filename":"妹子I, 和lyc工作认识，在一起一年，直到被告知都难以相信lyc的真实面目。据她描述，她所认识的lyc极度善良和纯粹，每天把“安得广厦千万间，大庇天下寒士俱欢颜”放在在嘴边。"},
                   {"type":"text/plain","filename":"Lyc声称自己就读于滑铁卢大学**专业，现多伦多大学applied math master candidate，实则在loo13x没过，fail课太多被滑铁卢kick out。骗所有朋友转学去了多伦多大学，实则辍学在多伦多无所事事专做坑蒙拐骗等勾当。因为学签去年过期，酒驾闹市护照被扣，lyc已非法停留于加拿大超过半年。lyc多次暗示父亲是江苏省省长**，实则普通工薪家庭，家里没有任何人在政府工作。他声称2015年成立的**，一直cannot be found，也请看到这篇文章的投资人多留一个心眼，谨慎起见。"}],
        "name":"刘宇辰",
        "contacts":{"wechat":"somewechataccount","cellphone":"123456789","other_key":"instagram","other_value":"henqiang"}
    }
  }