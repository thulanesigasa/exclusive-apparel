CREATE TRIGGER variants_stock_insert BEFORE INSERT ON variants
WHEN NEW.stock < 0 OR NEW.stock != CAST(NEW.stock AS INTEGER)
BEGIN SELECT RAISE(ABORT, 'invalid stock'); END;
--> statement-breakpoint
CREATE TRIGGER variants_stock_update BEFORE UPDATE OF stock ON variants
WHEN NEW.stock < 0 OR NEW.stock != CAST(NEW.stock AS INTEGER)
BEGIN SELECT RAISE(ABORT, 'invalid stock'); END;
--> statement-breakpoint
CREATE TRIGGER order_item_stock_guard BEFORE INSERT ON order_items
WHEN NEW.quantity < 1 OR NEW.quantity > 10 OR NEW.price < 1 OR
(SELECT stock FROM variants WHERE id = NEW.variant_id) < NEW.quantity
BEGIN SELECT RAISE(ABORT, 'insufficient stock'); END;
--> statement-breakpoint
CREATE TRIGGER order_item_reserve AFTER INSERT ON order_items
BEGIN UPDATE variants SET stock = stock - NEW.quantity WHERE id = NEW.variant_id; END;
--> statement-breakpoint
CREATE TRIGGER orders_status_guard BEFORE UPDATE OF status ON orders
WHEN OLD.status != NEW.status AND NOT (
(OLD.status = 'pending_payment' AND NEW.status IN ('paid','cancelled')) OR
(OLD.status = 'paid' AND NEW.status IN ('packed','refunded')) OR
(OLD.status = 'packed' AND NEW.status IN ('shipped','refunded')) OR
(OLD.status = 'shipped' AND NEW.status IN ('delivered','refunded')) OR
(OLD.status = 'delivered' AND NEW.status = 'refunded'))
BEGIN SELECT RAISE(ABORT, 'invalid order status transition'); END;
--> statement-breakpoint
CREATE TRIGGER orders_release_stock AFTER UPDATE OF status ON orders
WHEN OLD.status != NEW.status AND (NEW.status = 'cancelled' OR (NEW.status = 'refunded' AND NEW.is_test = 1))
BEGIN UPDATE variants SET stock = stock + COALESCE((SELECT SUM(quantity) FROM order_items WHERE order_id = NEW.id AND variant_id = variants.id),0)
WHERE id IN (SELECT variant_id FROM order_items WHERE order_id = NEW.id); END;
