Tourism Database Design with Web GIS
Database Tables

1.  users
    sqlCREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    address TEXT,
    profile_picture VARCHAR(255),
    role ENUM('super_admin', 'tourism_admin', 'consumer') NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
2.  tourist_destinations
    sqlCREATE TABLE tourist_destinations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    address TEXT,
    -- Basic spatial data
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    -- Additional GIS data for 3D visualization
    polygon_coordinates JSON, -- Store polygon area of destination
    geojson_data JSON, -- Complete GeoJSON for complex shapes
    altitude DECIMAL(8, 2), -- Height above sea level
    building_height DECIMAL(6, 2), -- For 3D rendering
    marker_type VARCHAR(50), -- Icon type for map marker
    marker_color VARCHAR(7), -- Hex color for marker
        -- Other attributes
        category VARCHAR(50),
        admin_id INT,
        status ENUM('active', 'inactive') DEFAULT 'active',
        opening_time TIME,
        closing_time TIME,

        -- Map display settings
        zoom_level INT DEFAULT 15,
        map_icon_url VARCHAR(255),
        thumbnail_url VARCHAR(255),

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (admin_id) REFERENCES users(id)
    );
3.  destination_photos
    sqlCREATE TABLE destination_photos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    destination_id INT NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    caption VARCHAR(255),
    photo_type ENUM('main', 'gallery', 'map_popup') DEFAULT 'gallery',
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (destination_id) REFERENCES tourist_destinations(id) ON DELETE CASCADE
    );
4.  tickets
    sqlCREATE TABLE tickets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    destination_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    quota_per_day INT NOT NULL,
    status ENUM('available', 'unavailable') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (destination_id) REFERENCES tourist_destinations(id)
    );
5.  orders
    sqlCREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    order_code VARCHAR(50) UNIQUE NOT NULL,
    visit_date DATE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'waiting_payment', 'paid', 'cancelled', 'refunded') DEFAULT 'pending',
    payment_deadline DATETIME,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
    );
6.  order_items
    sqlCREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    ticket_id INT NOT NULL,
    destination_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id),
    FOREIGN KEY (destination_id) REFERENCES tourist_destinations(id)
    );
7.  payment_transactions
    sqlCREATE TABLE payment_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    xendit_payment_id VARCHAR(100),
    payment_url VARCHAR(255),
    payment_method VARCHAR(50),
    payment_channel VARCHAR(50),
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50),
    callback_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id)
    );
8.  complaints
    sqlCREATE TABLE complaints (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    destination_id INT NOT NULL,
    subject VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    attachment VARCHAR(255),
    status ENUM('new', 'in_progress', 'resolved', 'rejected') DEFAULT 'new',
    response TEXT,
    response_date DATETIME,
    admin_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (destination_id) REFERENCES tourist_destinations(id),
    FOREIGN KEY (admin_id) REFERENCES users(id)
    );
9.  e_tickets
    sqlCREATE TABLE e_tickets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_item_id INT NOT NULL,
    ticket_code VARCHAR(100) UNIQUE NOT NULL,
    qr_code VARCHAR(255),
    status ENUM('active', 'used', 'expired') DEFAULT 'active',
    used_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_item_id) REFERENCES order_items(id)
    );
10. destination_categories
    sqlCREATE TABLE destination_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(255),
    map_icon VARCHAR(255), -- Special icon for map display
    color VARCHAR(7), -- Color theme for category
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
11. destination_reviews
    sqlCREATE TABLE destination_reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    destination_id INT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    photos JSON, -- Array of photo URLs
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (destination_id) REFERENCES tourist_destinations(id)
    );
12. map_layers
    sqlCREATE TABLE map_layers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    layer_type ENUM('base', 'overlay', 'marker_cluster') DEFAULT 'overlay',
    data_source VARCHAR(255), -- URL or table reference
    style_config JSON, -- Map styling configuration
    is_active BOOLEAN DEFAULT true,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
13. user_locations
    sqlCREATE TABLE user_locations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    accuracy DECIMAL(8, 2), -- Location accuracy in meters
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
    );
14. nearby_facilities
    sqlCREATE TABLE nearby_facilities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    destination_id INT NOT NULL,
    facility_type VARCHAR(50), -- restaurant, hotel, parking, atm, etc
    name VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    distance_meters INT, -- Distance from destination
    details JSON, -- Additional facility information
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (destination_id) REFERENCES tourist_destinations(id)
    );
15. activity_logs
    sqlCREATE TABLE activity_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    activity VARCHAR(255) NOT NULL,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
    );
    Spatial Data Indexes
    sql-- Spatial indexes for geographic queries
    CREATE SPATIAL INDEX idx_destinations_location
    ON tourist_destinations (latitude, longitude);

CREATE SPATIAL INDEX idx_facilities_location
ON nearby_facilities (latitude, longitude);

CREATE SPATIAL INDEX idx_user_locations
ON user_locations (latitude, longitude);

-- Regular indexes
CREATE INDEX idx_destinations_category ON tourist_destinations(category);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_visit_date ON orders(visit_date);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_tickets_destination ON tickets(destination_id);
GIS Data Structure
For the 3D Map Visualization (like in your screenshot), you'll need:

Base Map Data:

Street data
Building footprints
Terrain elevation

Tourist Destination Data:
json{
"type": "Feature",
"geometry": {
"type": "Point",
"coordinates": [longitude, latitude]
},
"properties": {
"id": 1,
"name": "Destination Name",
"category": "museum",
"icon": "museum-icon.png",
"color": "#FF5733",
"height": 100,
"popup_content": "<h3>Title</h3><p>Description</p>"
}
}

Map Configuration:
json{
"initial_view": {
"center": [106.8456, -6.2088],
"zoom": 12,
"pitch": 45,
"bearing": 0
},
"map_style": "mapbox://styles/mapbox/light-v10",
"building_3d": true,
"terrain": true
}

Example Queries
Get destinations with spatial data for map
sqlSELECT
d.id,
d.name,
d.description,
d.latitude,
d.longitude,
d.polygon_coordinates,
d.marker_type,
d.marker_color,
d.building_height,
c.name as category,
c.map_icon,
(SELECT file_path FROM destination_photos
WHERE destination_id = d.id AND photo_type = 'map_popup'
LIMIT 1) as popup_image
FROM tourist_destinations d
LEFT JOIN destination_categories c ON d.category = c.id
WHERE d.status = 'active'
AND d.latitude BETWEEN ? AND ?
AND d.longitude BETWEEN ? AND ?;
Handle order with multiple tickets
sql-- Create order
INSERT INTO orders (user_id, order_code, visit_date, total_amount, status)
VALUES (?, ?, ?, ?, 'pending');

-- Add multiple tickets to order
INSERT INTO order_items (order_id, ticket_id, destination_id, quantity, unit_price, subtotal)
VALUES
(?, ?, ?, 2, 50000, 100000),
(?, ?, ?, 1, 75000, 75000);

-- Generate e-tickets for each order item
INSERT INTO e*tickets (order_item_id, ticket_code, qr_code)
SELECT
id,
CONCAT('TKT', LPAD(id, 8, '0')),
CONCAT('QR*', UUID())
FROM order_items
WHERE order_id = ?;
Find nearby destinations
sqlSELECT
id,
name,
latitude,
longitude,
ST_Distance_Sphere(
POINT(longitude, latitude),
POINT(?, ?)
) AS distance_meters
FROM tourist_destinations
WHERE status = 'active'
HAVING distance_meters <= 5000
ORDER BY distance_meters;
Map Integration Notes
For your 3D map visualization like Mapbox, you'll need:

Mapbox GL JS or similar library
Vector tiles for base map
Custom markers with destination data
Popup components for destination info
Clustering for many points
3D building extrusion based on building_height
User location tracking
Route planning integration

The database design now supports all these requirements with proper spatial data storage and efficient querying capabilities.
