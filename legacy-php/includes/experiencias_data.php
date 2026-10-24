<?php
declare(strict_types=1);

/**
 * Historias de acompañamiento (editá nombres, textos e imágenes acá).
 *
 * @return list<array{
 *   slug: string,
 *   name: string,
 *   age: int,
 *   location: string,
 *   service: string,
 *   duration: string,
 *   summary: string,
 *   story: string,
 *   quote: string,
 *   image: string,
 *   image_alt: string
 * }>
 */
function get_experiencias(): array
{
    return [
        [
            'slug' => 'elena-ruiz',
            'name' => 'Elena Ruiz',
            'age' => 78,
            'location' => 'Palermo, CABA',
            'service' => 'Terapia individual y taller grupal de memoria',
            'duration' => '8 meses de acompañamiento',
            'summary' => 'Ansiedad tras mudarse con su hija y dificultad para dormir.',
            'story' => 'Elena llegó después de dejar su departamento de toda la vida. Trabajamos rutinas de sueño, ejercicios de respiración y la elaboración del duelo por su espacio. Además participó del taller de memoria, donde reconectó con recuerdos agradables y ganó confianza para socializar.',
            'quote' => 'Volví a sentir que tengo algo para contar. Duermo mejor y me animé a salir sola al parque.',
            'image' => 'img/experiencias/elena.jpg',
            'image_alt' => 'Elena Ruiz, 78 años, sonriendo en un entorno luminoso',
        ],
        [
            'slug' => 'jorge-perez',
            'name' => 'Jorge Pérez',
            'age' => 82,
            'location' => 'Flores, CABA',
            'service' => 'Terapia individual presencial',
            'duration' => '6 meses',
            'summary' => 'Duelo por la pérdida de su esposa y sensación de vacío.',
            'story' => 'Jorge acudió recomendado por su médico de cabecera. En sesión semanal exploramos su historia de pareja, ritualizamos pequeños homenajes y reconstruimos actividades con sentido (ajedrez, caminatas cortas). Involucramos a su nieta en una sesión de orientación familiar.',
            'quote' => 'No es que deje de extrañarla, pero ya no me siento perdido todo el día.',
            'image' => 'img/experiencias/jorge.jpg',
            'image_alt' => 'Jorge Pérez, 82 años, retrato con sonrisa',
        ],
        [
            'slug' => 'carmen-vidal',
            'name' => 'Carmen Vidal',
            'age' => 74,
            'location' => 'Online desde Mendoza',
            'service' => 'Terapia individual online',
            'duration' => '4 meses',
            'summary' => 'Miedo a caerse y evitación de salir de casa.',
            'story' => 'Por distancia elegimos modalidad virtual. Psicoeducación sobre ansiedad, plan gradual de exposición (primero balcón, luego cuadra) y coordinación con kinesiología. Sus hijos recibieron pautas para acompañar sin sobreproteger.',
            'quote' => 'Pude ir al kiosco de la esquina sola. Para mí eso fue un montón.',
            'image' => 'img/experiencias/carmen.jpg',
            'image_alt' => 'Carmen Vidal, 74 años, retrato sonriente',
        ],
        [
            'slug' => 'rosa-mendez',
            'name' => 'Rosa Méndez',
            'age' => 69,
            'location' => 'Villa Crespo, CABA',
            'service' => 'Encuentro grupal «Vínculos y familia»',
            'duration' => 'Taller de 8 encuentros',
            'summary' => 'Conflictos frecuentes con adultos hijos por decisiones de salud.',
            'story' => 'Rosa participó del ciclo grupal. Aprendió escucha activa y límites claros. Role-playing de conversaciones difíciles y tarea entre sesiones para acordar con su hijo un calendario de visitas y responsabilidades médicas.',
            'quote' => 'Ahora hablamos sin gritar. Me siento escuchada y respetada.',
            'image' => 'img/experiencias/rosa.jpg',
            'image_alt' => 'Rosa Méndez, 69 años, retrato cercano sonriendo',
        ],
        [
            'slug' => 'antonio-sosa',
            'name' => 'Antonio Sosa',
            'age' => 85,
            'location' => 'Caballito, CABA',
            'service' => 'Terapia individual + orientación a cuidador',
            'duration' => '1 año',
            'summary' => 'Depresión leve y bajo ánimo tras jubilación forzada por salud.',
            'story' => 'Antonio y su hija cuidadora asistieron a sesiones alternadas. Reactivamos hobbies (carpintería en escala), grupo de ajedrez en el barrio y revisión de medicación con su psiquiatra. Monitoreo de ánimo con escala simple semanal.',
            'quote' => 'Volví a tener ganas de levantarme temprano. Mi taller otra vez tiene proyectos.',
            'image' => 'img/experiencias/antonio.jpg',
            'image_alt' => 'Antonio Sosa, 85 años, retrato con barba canosa',
        ],
    ];
}
