insert into public.categories (name, slug, sort_order) values
  ('Bread','bread',1), ('Pastries','pastries',2), ('Cakes','cakes',3), ('Cookies','cookies',4)
on conflict (slug) do nothing;

-- Prices in kobo (₦1 = 100 kobo). Replace image_url with real images in /public/images or allowed remote URLs.
insert into public.products (category_id, name, slug, description, price_kobo, image_url, is_featured)
select c.id, v.name, v.slug, v.description, v.price_kobo, v.image_url, v.is_featured
from (values
  ('bread','Classic Sliced Loaf','classic-sliced-loaf','Soft, fluffy white loaf baked fresh every morning.',150000,'/images/classic-loaf.jpg',true),
  ('bread','Whole Wheat Loaf','whole-wheat-loaf','Hearty wholemeal bread with a nutty crust.',180000,'/images/wheat-loaf.jpg',false),
  ('bread','Sourdough Boule','sourdough-boule','Slow-fermented sourdough with a crackly crust.',350000,'/images/sourdough.jpg',true),
  ('pastries','Butter Croissant','butter-croissant','Flaky, golden, laminated with real butter.',120000,'/images/croissant.jpg',true),
  ('pastries','Meat Pie','meat-pie','Buttery pastry filled with spiced minced beef and potato.',100000,'/images/meat-pie.jpg',false),
  ('pastries','Sausage Roll','sausage-roll','Seasoned sausage wrapped in golden puff pastry.',90000,'/images/sausage-roll.jpg',false),
  ('pastries','Cinnamon Roll','cinnamon-roll','Warm spiral roll with cinnamon sugar and cream glaze.',200000,'/images/cinnamon-roll.jpg',false),
  ('cakes','Chocolate Fudge Cake','chocolate-fudge-cake','Rich three-layer chocolate cake with fudge frosting (8").',1800000,'/images/choc-cake.jpg',true),
  ('cakes','Vanilla Celebration Cake','vanilla-celebration-cake','Light vanilla sponge with buttercream (8").',1600000,'/images/vanilla-cake.jpg',false),
  ('cakes','Red Velvet Cake','red-velvet-cake','Classic red velvet with cream cheese frosting (8").',2000000,'/images/red-velvet.jpg',false),
  ('cookies','Chocolate Chip Cookies (6)','choc-chip-cookies-6','Chewy, golden cookies loaded with chocolate chunks.',250000,'/images/choc-chip.jpg',true),
  ('cookies','Oatmeal Raisin Cookies (6)','oatmeal-raisin-cookies-6','Wholesome oats, plump raisins, a hint of cinnamon.',230000,'/images/oatmeal.jpg',false)
) as v(cat_slug,name,slug,description,price_kobo,image_url,is_featured)
join public.categories c on c.slug = v.cat_slug
on conflict (slug) do nothing;
