create table FoodGroup(
	Id uniqueidentifier primary key,
	GroupName nvarchar(50) not null,
	GroupUrl nvarchar(50) not null,
)

create table FoodInfo(
	Id uniqueidentifier primary key,
	FoodGroupId uniqueidentifier not null,	--���id
	FoodName nvarchar(50) not null,			--ʳ������
	FoodImager nvarchar(100) not null,		--ʳ��ͼƬ
	FoodHeat float null,					--ʳ������
	Remark nvarchar(max) null,				--��ע
	Fat float null,							--֬��
	Cellulose float null,					--��ά��
	Carbohydrate float null,				--̼ˮ������
	Protein float null,						--������
)