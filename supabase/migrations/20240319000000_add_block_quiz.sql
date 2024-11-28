-- Insérer le quiz de validation du bloc
INSERT INTO quizzes (block_id, title, description, quiz_type, passing_score)
SELECT 
    id,
    'Quiz de validation - Introduction au droit',
    'Quiz final pour valider vos connaissances en introduction au droit',
    'block_quiz',
    70
FROM skill_blocks 
WHERE name = 'Introduction au droit'
RETURNING id;

-- Insérer les questions du quiz
WITH quiz_id AS (
    SELECT id 
    FROM quizzes 
    WHERE title = 'Quiz de validation - Introduction au droit'
    LIMIT 1
)
INSERT INTO quiz_questions (quiz_id, question, explanation, order_index)
VALUES
    ((SELECT id FROM quiz_id), 'Quelle est la principale différence entre le droit civil et le droit pénal ?', 'Le droit civil régit les relations entre les personnes privées, tandis que le droit pénal définit les infractions et leurs sanctions.', 1),
    ((SELECT id FROM quiz_id), 'Qu''est-ce qu''une personne morale ?', 'Une personne morale est une entité juridique distincte des personnes physiques qui la composent, comme une entreprise ou une association.', 2),
    ((SELECT id FROM quiz_id), 'Quel est le rôle de la jurisprudence dans le système juridique français ?', 'La jurisprudence est l''ensemble des décisions de justice qui interprètent et appliquent la loi, servant de référence pour les cas similaires.', 3),
    ((SELECT id FROM quiz_id), 'Quelles sont les principales sources du droit français ?', 'Les principales sources sont la Constitution, les traités internationaux, les lois, les règlements et la jurisprudence.', 4),
    ((SELECT id FROM quiz_id), 'Qu''est-ce que la hiérarchie des normes ?', 'C''est l''organisation pyramidale des différentes règles de droit, où les normes inférieures doivent respecter les normes supérieures.', 5);

-- Insérer les réponses pour chaque question
WITH questions AS (
    SELECT q.id, q.order_index
    FROM quizzes quiz
    JOIN quiz_questions q ON q.quiz_id = quiz.id
    WHERE quiz.title = 'Quiz de validation - Introduction au droit'
    ORDER BY q.order_index
)
INSERT INTO quiz_answers (question_id, answer, is_correct, explanation, order_index)
SELECT
    id,
    CASE order_index
        WHEN 1 THEN answer
        WHEN 2 THEN answer
        WHEN 3 THEN answer
        WHEN 4 THEN answer
        WHEN 5 THEN answer
    END,
    CASE order_index
        WHEN 1 THEN is_correct::boolean
        WHEN 2 THEN is_correct::boolean
        WHEN 3 THEN is_correct::boolean
        WHEN 4 THEN is_correct::boolean
        WHEN 5 THEN is_correct::boolean
    END,
    CASE order_index
        WHEN 1 THEN explanation
        WHEN 2 THEN explanation
        WHEN 3 THEN explanation
        WHEN 4 THEN explanation
        WHEN 5 THEN explanation
    END,
    ans_order
FROM questions,
(VALUES
    (1, 'Le droit civil concerne les relations privées, le droit pénal les infractions', true, 'Le droit civil régit les relations entre particuliers, tandis que le pénal sanctionne les comportements répréhensibles.', 1),
    (1, 'Le droit civil est plus important que le droit pénal', false, 'Les deux branches du droit ont leur importance spécifique.', 2),
    (1, 'Le droit pénal ne concerne que les entreprises', false, 'Le droit pénal s''applique à toutes les personnes, physiques comme morales.', 3),
    (1, 'Le droit civil est uniquement pour les mariages', false, 'Le droit civil couvre de nombreux aspects des relations privées.', 4),

    (2, 'Une entité juridique distincte des personnes physiques qui la composent', true, 'C''est la définition exacte d''une personne morale.', 1),
    (2, 'Une personne particulièrement éthique', false, 'La morale n''est pas liée à la notion juridique de personne morale.', 2),
    (2, 'Un individu majeur', false, 'Cela décrit une personne physique, non une personne morale.', 3),
    (2, 'Un représentant de l''État', false, 'Les représentants de l''État sont des personnes physiques.', 4),

    (3, 'Interpréter et appliquer la loi à travers les décisions de justice', true, 'La jurisprudence permet d''adapter et préciser l''application des textes.', 1),
    (3, 'Remplacer la loi', false, 'La jurisprudence complète la loi mais ne la remplace pas.', 2),
    (3, 'Uniquement sanctionner les criminels', false, 'La jurisprudence concerne tous les domaines du droit.', 3),
    (3, 'Créer de nouvelles lois', false, 'Seul le législateur peut créer des lois.', 4),

    (4, 'Constitution, traités, lois, règlements et jurisprudence', true, 'Ce sont les principales sources du droit français, dans leur ordre hiérarchique.', 1),
    (4, 'Uniquement les lois votées par le Parlement', false, 'Il existe d''autres sources de droit importantes.', 2),
    (4, 'Les décisions de justice uniquement', false, 'Les décisions de justice ne sont qu''une source parmi d''autres.', 3),
    (4, 'Les opinions des juristes', false, 'Les opinions des juristes ne sont pas une source directe du droit.', 4),

    (5, 'L''organisation pyramidale des normes juridiques', true, 'Cette organisation assure la cohérence du système juridique.', 1),
    (5, 'Le classement des tribunaux', false, 'Cela concerne l''organisation judiciaire, non les normes.', 2),
    (5, 'L''ordre des avocats', false, 'L''ordre des avocats est une organisation professionnelle.', 3),
    (5, 'La liste des codes juridiques', false, 'Les codes sont des outils de compilation des normes.', 4)
) AS answers(q_order, answer, is_correct, explanation, ans_order);