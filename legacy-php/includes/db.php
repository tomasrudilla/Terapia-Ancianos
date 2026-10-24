<?php
declare(strict_types=1);

require_once __DIR__ . '/../config.php';

function db_driver(): string
{
    $url = getenv('DATABASE_URL') ?: getenv('POSTGRES_URL') ?: '';
    return $url !== '' ? 'pgsql' : 'sqlite';
}

function db(): PDO
{
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    if (db_driver() === 'pgsql') {
        $pdo = connect_postgres();
    } else {
        $dir = dirname(DB_PATH);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        $pdo = new PDO('sqlite:' . DB_PATH, null, null, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
        $pdo->exec('PRAGMA foreign_keys = ON');
    }

    init_schema($pdo);
    return $pdo;
}

function connect_postgres(): PDO
{
    $url = getenv('DATABASE_URL') ?: getenv('POSTGRES_URL');
    if ($url === false || $url === '') {
        throw new RuntimeException('DATABASE_URL no configurada');
    }

    $parts = parse_url($url);
    if ($parts === false || ($parts['scheme'] ?? '') !== 'postgres' && ($parts['scheme'] ?? '') !== 'postgresql') {
        throw new RuntimeException('DATABASE_URL inválida');
    }

    $host = $parts['host'] ?? 'localhost';
    $port = $parts['port'] ?? 5432;
    $user = $parts['user'] ?? '';
    $pass = $parts['pass'] ?? '';
    $dbname = ltrim($parts['path'] ?? '', '/');
    $dsn = "pgsql:host={$host};port={$port};dbname={$dbname};sslmode=require";

    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    return $pdo;
}

function init_schema(PDO $pdo): void
{
    if (db_driver() === 'pgsql') {
        init_schema_postgres($pdo);
    } else {
        init_schema_sqlite($pdo);
    }
    migrate_schema($pdo);
    seed_demo_events($pdo);
}

function init_schema_sqlite(PDO $pdo): void
{
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            booking_date TEXT NOT NULL,
            booking_time TEXT NOT NULL,
            client_name TEXT NOT NULL,
            client_email TEXT NOT NULL,
            client_phone TEXT,
            notes TEXT,
            status TEXT NOT NULL DEFAULT 'confirmed',
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            UNIQUE(booking_date, booking_time)
        );

        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            event_date TEXT NOT NULL,
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL,
            event_type TEXT NOT NULL DEFAULT 'event',
            blocks_booking INTEGER NOT NULL DEFAULT 1,
            max_participants INTEGER NOT NULL DEFAULT 12,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS blocked_slots (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            block_date TEXT NOT NULL,
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL,
            reason TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS event_registrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_id INTEGER NOT NULL,
            participant_name TEXT NOT NULL,
            participant_email TEXT NOT NULL,
            participant_phone TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            UNIQUE(event_id, participant_email),
            FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
        );
    ");
}

function init_schema_postgres(PDO $pdo): void
{
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS bookings (
            id SERIAL PRIMARY KEY,
            booking_date TEXT NOT NULL,
            booking_time TEXT NOT NULL,
            client_name TEXT NOT NULL,
            client_email TEXT NOT NULL,
            client_phone TEXT,
            notes TEXT,
            status TEXT NOT NULL DEFAULT 'confirmed',
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE(booking_date, booking_time)
        );

        CREATE TABLE IF NOT EXISTS events (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            event_date TEXT NOT NULL,
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL,
            event_type TEXT NOT NULL DEFAULT 'event',
            blocks_booking INTEGER NOT NULL DEFAULT 1,
            max_participants INTEGER NOT NULL DEFAULT 12,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS blocked_slots (
            id SERIAL PRIMARY KEY,
            block_date TEXT NOT NULL,
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL,
            reason TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS event_registrations (
            id SERIAL PRIMARY KEY,
            event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
            participant_name TEXT NOT NULL,
            participant_email TEXT NOT NULL,
            participant_phone TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE(event_id, participant_email)
        );
    ");
}

function migrate_schema(PDO $pdo): void
{
    if (db_driver() === 'pgsql') {
        $stmt = $pdo->query("
            SELECT column_name FROM information_schema.columns
            WHERE table_name = 'events' AND column_name = 'max_participants'
        ");
        if ($stmt->fetch() === false) {
            $pdo->exec('ALTER TABLE events ADD COLUMN max_participants INTEGER NOT NULL DEFAULT 12');
        }
        return;
    }

    $cols = array_column($pdo->query('PRAGMA table_info(events)')->fetchAll(), 'name');
    if (!in_array('max_participants', $cols, true)) {
        $pdo->exec('ALTER TABLE events ADD COLUMN max_participants INTEGER NOT NULL DEFAULT 12');
    }
}

function seed_demo_events(PDO $pdo): void
{
    $stmt = $pdo->query("SELECT COUNT(*) FROM events WHERE event_type = 'event'");
    if ((int) $stmt->fetchColumn() > 0) {
        return;
    }

    $nextWed = strtotime('next wednesday');
    $nextFri = strtotime('next friday');
    $date1 = date('Y-m-d', $nextWed);
    $date2 = date('Y-m-d', $nextFri);

    $insert = $pdo->prepare("
        INSERT INTO events (title, description, event_date, start_time, end_time, event_type, blocks_booking, max_participants)
        VALUES (?, ?, ?, ?, ?, 'event', 1, ?)
    ");

    $insert->execute([
        'Taller de memoria y relajación',
        'Ejercicios guiados de reminiscencia y respiración en un grupo reducido.',
        $date1,
        '10:00',
        '12:00',
        10,
    ]);
    $event1 = (int) $pdo->lastInsertId();

    $insert->execute([
        'Encuentro grupal: vínculos y familia',
        'Espacio para compartir experiencias y estrategias de comunicación con seres queridos.',
        $date2,
        '15:00',
        '17:00',
        8,
    ]);
    $event2 = (int) $pdo->lastInsertId();

    $reg = $pdo->prepare("
        INSERT INTO event_registrations (event_id, participant_name, participant_email, participant_phone)
        VALUES (?, ?, ?, ?)
    ");
    $reg->execute([$event1, 'María González', 'maria.demo@ejemplo.com', '11 5555-0101']);
    $reg->execute([$event1, 'Roberto Sánchez', 'roberto.demo@ejemplo.com', null]);
    $reg->execute([$event1, 'Elena Ruiz', 'elena.demo@ejemplo.com', '11 5555-0103']);
    $reg->execute([$event2, 'Jorge Pérez', 'jorge.demo@ejemplo.com', null]);
    $reg->execute([$event2, 'Ana Martínez', 'ana.demo@ejemplo.com', '11 5555-0202']);
}

/** @return list<array<string, mixed>> */
function get_group_events_for_date(PDO $pdo, string $date): array
{
    $stmt = $pdo->prepare("
        SELECT * FROM events
        WHERE event_date = ? AND event_type = 'event'
        ORDER BY start_time
    ");
    $stmt->execute([$date]);
    $events = $stmt->fetchAll();
    return array_map(fn ($e) => enrich_event($pdo, $e), $events);
}

/** @param array<string, mixed> $event */
function enrich_event(PDO $pdo, array $event): array
{
    $stmt = $pdo->prepare("
        SELECT participant_name, participant_email, participant_phone, created_at
        FROM event_registrations
        WHERE event_id = ?
        ORDER BY created_at
    ");
    $stmt->execute([(int) $event['id']]);
    $registrations = $stmt->fetchAll();
    $max = (int) ($event['max_participants'] ?? 12);
    $count = count($registrations);

    return [
        'id' => (int) $event['id'],
        'title' => $event['title'],
        'description' => $event['description'] ?? '',
        'event_date' => $event['event_date'],
        'start_time' => $event['start_time'],
        'end_time' => $event['end_time'],
        'blocks_booking' => (int) $event['blocks_booking'] === 1,
        'max_participants' => $max,
        'registration_count' => $count,
        'spots_left' => max(0, $max - $count),
        'is_full' => $count >= $max,
        'participants' => array_map(static fn ($r) => [
            'name' => $r['participant_name'],
        ], $registrations),
    ];
}

function get_event_by_id(PDO $pdo, int $id): ?array
{
    $stmt = $pdo->prepare("SELECT * FROM events WHERE id = ? AND event_type = 'event'");
    $stmt->execute([$id]);
    $event = $stmt->fetch();
    return $event ? enrich_event($pdo, $event) : null;
}

/** @return list<string> */
function dates_with_group_events_in_month(PDO $pdo, string $month): array
{
    if (!preg_match('/^\d{4}-\d{2}$/', $month)) {
        return [];
    }
    [$y, $m] = array_map('intval', explode('-', $month));
    $from = sprintf('%04d-%02d-01', $y, $m);
    $to = sprintf('%04d-%02d-%02d', $y, $m, (int) date('t', strtotime($from)));
    $today = date('Y-m-d');

    $stmt = $pdo->prepare("
        SELECT DISTINCT event_date FROM events
        WHERE event_type = 'event' AND event_date BETWEEN ? AND ? AND event_date >= ?
        ORDER BY event_date
    ");
    $stmt->execute([$from, $to, $today]);
    return array_column($stmt->fetchAll(), 'event_date');
}

function time_to_minutes(string $time): int
{
    [$h, $m] = array_map('intval', explode(':', $time));
    return $h * 60 + $m;
}

function minutes_to_time(int $minutes): string
{
    $h = intdiv($minutes, 60);
    $m = $minutes % 60;
    return sprintf('%02d:%02d', $h, $m);
}

/** @return list<string> HH:MM slots for a date */
function generate_day_slots(string $date): array
{
    $dow = (int) date('N', strtotime($date));
    if (!in_array($dow, WORK_DAYS, true)) {
        return [];
    }
    $start = time_to_minutes(WORK_START);
    $end = time_to_minutes(WORK_END);
    $step = SLOT_MINUTES;
    $slots = [];
    for ($t = $start; $t + $step <= $end; $t += $step) {
        $slots[] = minutes_to_time($t);
    }
    return $slots;
}

function slot_overlaps(string $slotTime, int $slotMinutes, string $start, string $end): bool
{
    $s = time_to_minutes($slotTime);
    $e = $s + $slotMinutes;
    $bs = time_to_minutes($start);
    $be = time_to_minutes($end);
    return $s < $be && $e > $bs;
}

function get_booked_times(PDO $pdo, string $date): array
{
    $stmt = $pdo->prepare("
        SELECT booking_time FROM bookings
        WHERE booking_date = ? AND status != 'cancelled'
    ");
    $stmt->execute([$date]);
    return array_column($stmt->fetchAll(), 'booking_time');
}

function get_availability(PDO $pdo, string $date): array
{
    $slots = generate_day_slots($date);
    if ($slots === []) {
        return [];
    }

    $booked = get_booked_times($pdo, $date);

    $stmt = $pdo->prepare("SELECT start_time, end_time FROM blocked_slots WHERE block_date = ?");
    $stmt->execute([$date]);
    $blocks = $stmt->fetchAll();

    $stmt = $pdo->prepare("
        SELECT start_time, end_time FROM events
        WHERE event_date = ? AND blocks_booking = 1
    ");
    $stmt->execute([$date]);
    $events = $stmt->fetchAll();

    $available = [];
    foreach ($slots as $slot) {
        if (in_array($slot, $booked, true)) {
            continue;
        }
        $blocked = false;
        foreach (array_merge($blocks, $events) as $row) {
            if (slot_overlaps($slot, SLOT_MINUTES, $row['start_time'], $row['end_time'])) {
                $blocked = true;
                break;
            }
        }
        if (!$blocked) {
            $available[] = $slot;
        }
    }
    return $available;
}
