create table FoodGroup(
	Id uniqueidentifier primary key,
	GroupName nvarchar(50) not null,
	GroupUrl nvarchar(50) not null,
)

create table FoodInfo(
	Id uniqueidentifier primary key,
	FoodGroupId uniqueidentifier not null,	--组板id
	FoodName nvarchar(50) not null,			--食物名称
	FoodImager nvarchar(100) not null,		--食物图片
	FoodHeat float null,					--食物热量
	Remark nvarchar(max) null,				--备注
	Fat float null,							--脂肪
	Cellulose float null,					--纤维素
	Carbohydrate float null,				--碳水化合物
	Protein float null,						--蛋白质
)