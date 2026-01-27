-- membuat dan memakai database 
create database if not exists point_of_sale_1;
use point_of_sale_1;

-- membuat tabel user 
create table if not exists users(
	id int unsigned primary key auto_increment, -- unsigned untuk id agar tidak bisa negatif
    user_code varchar(20) unique not null, -- user code dibuat unique agar 1 code = 1 user
    name varchar(50) not null,
    email varchar(150) unique not null, -- email unique agara tidak ada duplikasi / email yang sama
    password varchar(255) not null,
    role enum('admin', 'staff') not null default 'staff', 
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp on update current_timestamp
);

-- membuat tabel customer
create table if not exists customers(
	id int unsigned primary key auto_increment,
    customer_code varchar(20) unique not null,
    name varchar(50) not null,
    address text,
    phone varchar(20),
	created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp on update current_timestamp
);

-- membuat table category
create table if not exists categories(
	id int unsigned primary key auto_increment,
    category_code varchar(20) unique not null,
    name varchar(50) not null,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp on update current_timestamp
); 

-- membuat table product
create table if not exists products(
	id int unsigned primary key auto_increment,
    category_id int unsigned not null,
    name varchar(50) not null,
    price decimal(15, 2) default 0 not null check(price >= 0), -- memakai default agar nilai tidak null, menggunakan chek agar nilai price tidak bisa minus
    stock int unsigned default 0 not null, -- unsigned agar tidak bisa minus, default 0 agar selalu ada nilai dan tidak null
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp on update current_timestamp,
    foreign key(category_id) references categories(id) on update cascade on delete restrict -- menghubungkan table product dan category, data cateory akan secara otomats berubah apabila data di tabel category juga ikuut berubah
);

-- membuat table transaction (header transaction)
create table if not exists transactions(
	id int unsigned primary key auto_increment,
    transaction_code varchar(50) unique not null, -- ini nanti dipakai sebagai nomer dari nota 
    user_id int unsigned,
    customer_id int unsigned,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp on update current_timestamp,
    foreign key(user_id) references users(id) on update cascade on delete restrict, -- menghubungkan table transaction dan user
    foreign key(customer_id) references customers(id) on update cascade on delete restrict -- menghubungkan transaction dengan customer
);

-- membuat table items transaction ( detail transaction)
create table if not exists items_transactions(
	id int unsigned primary key auto_increment,
    transaction_id int unsigned,
    product_id int unsigned,
    on_sales_price decimal(15, 2) default 0 not null check(on_sales_price >=0 ),
    qty int unsigned default 0 not null,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp on update current_timestamp,
    foreign key(transaction_id) references transactions(id) on update cascade on delete cascade, -- menghubungkan ke transaction // jika diupdate ikut update jika dihapus ikut terhapus
    foreign key(product_id) references products(id) on update cascade on delete restrict 
);
    

alter table products add column product_code varchar(20) unique not null;
ALTER TABLE transactions ADD COLUMN total_price DECIMAL(15, 2) DEFAULT 0 NOT NULL CHECK(total_price >= 0);

insert into users(user_code, name, email, password, role) values ("USR-001", admin, admin@admin, admin, admin);