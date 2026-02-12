-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES TABLE (User Roles)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  phone text,
  address text,
  city text,
  state text,
  postal_code text,
  role text default 'customer' check (role in ('customer', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile."
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile."
  on public.profiles for update
  using (auth.uid() = id);

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, phone, role)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'phone', 
    'customer'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- PRODUCTS TABLE
create table public.products (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text,
  brand text,
  price numeric not null,
  category text not null,
  stock integer default 0,
  images text[] default array[]::text[],
  features jsonb default '{}'::jsonb, -- Stores colors, storage, etc.
  is_featured boolean default false
);

-- Enable RLS on products
alter table public.products enable row level security;

create policy "Products are viewable by everyone"
  on public.products for select
  using (true);

create policy "Admins can insert products"
  on public.products for insert
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Admins can update products"
  on public.products for update
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Admins can delete products"
  on public.products for delete
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));


-- ORDERS TABLE
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id), -- Optional link to registered user
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  shipping_address text not null,
  items jsonb not null,
  total_amount numeric not null,
  status text default 'pending' check (status in ('pending', 'pending_payment', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_method text default 'bank_transfer',
  payment_proof_url text
);

-- Enable RLS on orders
alter table public.orders enable row level security;

create policy "Users can view their own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Admins can view all orders"
  on public.orders for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Anyone can create an order"
  on public.orders for insert
  with check (true);

create policy "Admins can update orders"
  on public.orders for update
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));


-- BANNERS TABLE
create table public.banners (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  subtitle text,
  image_url text not null,
  link text default '/shop',
  active boolean default true
);

alter table public.banners enable row level security;

create policy "Banners are viewable by everyone"
  on public.banners for select
  using (true);

create policy "Admins can manage banners"
  on public.banners for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));


-- CUSTOMER PROFILES (VIP/Blacklist Status)
create table public.customer_profiles (
  email text primary key,
  status text default 'regular' check (status in ('regular', 'vip', 'blacklist')),
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.customer_profiles enable row level security;

create policy "Admins can view and manage customer profiles"
  on public.customer_profiles for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Update orders table with shipping_fee, subtotal, and sequential order number
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_fee numeric DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS subtotal numeric DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_number BIGINT GENERATED ALWAYS AS IDENTITY;
