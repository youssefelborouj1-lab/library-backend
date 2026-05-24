USE library_db;

INSERT INTO roles (name) VALUES ('admin'), ('bibliothecaire'), ('utilisateur')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO users (name, email, password, role_id) VALUES
('Admin Principal', 'admin@library.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1),
('Marie Dupont', 'marie@library.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2),
('Ahmed Benali', 'ahmed@library.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3),
('Sophie Martin', 'sophie@library.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3),
('Karim Zidane', 'karim@library.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3)
ON DUPLICATE KEY UPDATE email=VALUES(email);

INSERT INTO categories (name, description) VALUES
('Informatique', 'Livres de programmation, algorithmes, réseaux et systèmes'),
('Mathématiques', 'Algèbre, analyse, probabilités et statistiques'),
('Physique', 'Mécanique, électromagnétisme, thermodynamique'),
('Chimie', 'Chimie organique, inorganique et physique'),
('Biologie', 'Biologie cellulaire, génétique, écologie'),
('Littérature', 'Romans, nouvelles et poésie'),
('Histoire', 'Histoire mondiale, régionale et contemporaine'),
('Philosophie', 'Philosophie ancienne, moderne et contemporaine'),
('Économie', 'Microéconomie, macroéconomie, finance'),
('Droit', 'Droit civil, pénal et international')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO books (title, author, isbn, category_id, description, publisher, published_year, pages, language, borrow_count) VALUES
('Introduction aux algorithmes', 'Thomas H. Cormen', '978-2100545612', 1, 'Ce livre couvre un large éventail de techniques et domaines d\'algorithmes. Il est utilisé comme manuel dans de nombreuses universités à travers le monde pour les cours d\'algorithmique.', 'Dunod', 2010, 1312, 'Français', 47),
('Le langage C', 'Brian W. Kernighan', '978-2100085163', 1, 'La référence absolue du langage C par ses créateurs. Un classique incontournable pour tout développeur souhaitant maîtriser les fondements de la programmation système.', 'Dunod', 2004, 304, 'Français', 38),
('Clean Code', 'Robert C. Martin', '978-0132350884', 1, 'Un guide pratique pour écrire du code propre, lisible et maintenable. Indispensable pour tout développeur professionnel souhaitant améliorer la qualité de son code.', 'Prentice Hall', 2008, 464, 'Français', 52),
('Analyse réelle', 'Walter Rudin', '978-0070542358', 2, 'Un texte classique d\'analyse mathématique couvrant les fondements de l\'analyse réelle et complexe. Recommandé pour les étudiants en mathématiques avancées.', 'McGraw-Hill', 1976, 342, 'Français', 29),
('Algèbre linéaire', 'Gilbert Strang', '978-0980232776', 2, 'Une introduction complète à l\'algèbre linéaire avec applications en sciences et ingénierie. Approche intuitive et pratique de la matière.', 'Wellesley', 2009, 584, 'Français', 41),
('Mécanique quantique', 'David J. Griffiths', '978-0131118928', 3, 'Introduction à la mécanique quantique pour les étudiants en physique de premier cycle. Présentation claire et accessible des concepts fondamentaux.', 'Pearson', 2004, 480, 'Français', 33),
('Thermodynamique', 'Enrico Fermi', '978-0486603612', 3, 'Cours classique de thermodynamique par l\'un des plus grands physiciens du XXe siècle. Présentation rigoureuse et concise des lois de la thermodynamique.', 'Dover', 2012, 160, 'Français', 21),
('Chimie organique', 'Jonathan Clayden', '978-0198503460', 4, 'Manuel complet de chimie organique couvrant tous les aspects de la discipline. Riche en illustrations et exemples pratiques pour faciliter la compréhension.', 'Oxford', 2012, 1264, 'Français', 26),
('Biologie cellulaire', 'Albert Lehninger', '978-0716743392', 5, 'Un texte fondamental en biochimie et biologie cellulaire. Couvre les processus métaboliques, la structure cellulaire et les mécanismes moléculaires.', 'W.H. Freeman', 2008, 1100, 'Français', 35),
('Les Misérables', 'Victor Hugo', '978-2070409228', 6, 'Chef-d\'oeuvre de la littérature française, ce roman monumental retrace le destin de Jean Valjean dans la France du XIXe siècle. Un portrait saisissant de la société et de la condition humaine.', 'Gallimard', 1999, 1500, 'Français', 58),
('L\'Étranger', 'Albert Camus', '978-2070360024', 6, 'Roman emblématique de l\'existentialisme français. L\'histoire de Meursault, un homme indifférent au monde qui l\'entoure, devient le prétexte à une réflexion profonde sur le sens de la vie.', 'Gallimard', 1942, 186, 'Français', 67),
('Histoire de France', 'Jules Michelet', '978-2012200500', 7, 'L\'oeuvre maîtresse de Michelet, une fresque monumentale de l\'histoire de France depuis les origines jusqu\'à la Révolution. Un classique indépassable de l\'historiographie française.', 'Hachette', 2008, 800, 'Français', 19),
('La République', 'Platon', '978-2070353019', 8, 'Dialogue philosophique fondateur de la pensée politique occidentale. Platon y expose sa vision de la cité idéale et discute de la justice, de l\'éducation et du rôle des philosophes.', 'Gallimard', 1993, 514, 'Français', 44),
('Principes d\'économie', 'Gregory Mankiw', '978-2804184582', 9, 'Manuel d\'introduction à l\'économie le plus utilisé dans le monde. Présente les concepts fondamentaux de la micro et macroéconomie de façon claire et pédagogique.', 'De Boeck', 2016, 920, 'Français', 39),
('Droit civil', 'François Terré', '978-2247082100', 10, 'Manuel de référence en droit civil français. Couvre l\'ensemble des institutions du droit privé avec rigueur et clarté. Indispensable pour les étudiants en droit.', 'Dalloz', 2014, 1200, 'Français', 28)
ON DUPLICATE KEY UPDATE title=VALUES(title);

INSERT INTO copies (book_id, code, status, location) VALUES
(1, 'INF-001-A', 'available', 'Rayon A1'),
(1, 'INF-001-B', 'available', 'Rayon A1'),
(1, 'INF-001-C', 'borrowed', 'Rayon A1'),
(2, 'INF-002-A', 'available', 'Rayon A1'),
(2, 'INF-002-B', 'available', 'Rayon A1'),
(3, 'INF-003-A', 'available', 'Rayon A2'),
(3, 'INF-003-B', 'borrowed', 'Rayon A2'),
(4, 'MAT-004-A', 'available', 'Rayon B1'),
(4, 'MAT-004-B', 'available', 'Rayon B1'),
(5, 'MAT-005-A', 'available', 'Rayon B1'),
(6, 'PHY-006-A', 'available', 'Rayon C1'),
(6, 'PHY-006-B', 'reserved', 'Rayon C1'),
(7, 'PHY-007-A', 'available', 'Rayon C1'),
(8, 'CHI-008-A', 'available', 'Rayon D1'),
(9, 'BIO-009-A', 'available', 'Rayon E1'),
(9, 'BIO-009-B', 'available', 'Rayon E1'),
(10, 'LIT-010-A', 'available', 'Rayon F1'),
(10, 'LIT-010-B', 'available', 'Rayon F1'),
(10, 'LIT-010-C', 'borrowed', 'Rayon F1'),
(11, 'LIT-011-A', 'available', 'Rayon F2'),
(11, 'LIT-011-B', 'available', 'Rayon F2'),
(12, 'HIS-012-A', 'available', 'Rayon G1'),
(13, 'PHI-013-A', 'available', 'Rayon H1'),
(13, 'PHI-013-B', 'available', 'Rayon H1'),
(14, 'ECO-014-A', 'available', 'Rayon I1'),
(14, 'ECO-014-B', 'borrowed', 'Rayon I1'),
(15, 'DRO-015-A', 'available', 'Rayon J1')
ON DUPLICATE KEY UPDATE code=VALUES(code);

INSERT INTO borrows (user_id, copy_id, book_id, borrowed_at, due_date, status) VALUES
(3, 3, 1, DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_ADD(CURDATE(), INTERVAL 4 DAY), 'active'),
(3, 7, 3, DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(CURDATE(), INTERVAL 6 DAY), 'overdue'),
(4, 19, 10, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(CURDATE(), INTERVAL 9 DAY), 'active'),
(4, 26, 14, DATE_SUB(NOW(), INTERVAL 18 DAY), DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'overdue'),
(5, 1, 1, DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_SUB(NOW(), INTERVAL 16 DAY), 'returned');

UPDATE borrows SET returned_at = DATE_SUB(NOW(), INTERVAL 16 DAY), status = 'returned' WHERE id = 5;

INSERT INTO reservations (user_id, book_id, copy_id, status, reserved_at, expires_at) VALUES
(3, 6, 12, 'confirmed', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 5 DAY)),
(4, 2, NULL, 'pending', NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY));

INSERT INTO notifications (user_id, title, message, type, is_read) VALUES
(3, 'Emprunt en retard', 'Le livre "Clean Code" est en retard. Merci de le retourner dès que possible.', 'warning', 0),
(3, 'Réservation confirmée', 'Votre réservation pour "Mécanique quantique" a été confirmée.', 'success', 0),
(4, 'Emprunt en retard', 'Le livre "Principes d\'économie" est en retard. Des frais peuvent s\'appliquer.', 'warning', 0),
(4, 'Bienvenue !', 'Bienvenue sur la bibliothèque universitaire. Bonne lecture !', 'info', 1);
