-- Insert sample grammar questions for lesson 4
INSERT INTO grammar_questions (lesson_id, type, example, text, options, correct_answer, points, explanation) VALUES
(4, 'multiple_choice', '例: ～てもいいです', '今日は学校に行かないで（　　）。', '["いいです", "よくないです", "行きます", "来ます"]', 'いいです', 10, '今日は学校に行かないでいいです means ''It''s okay not to go to school today.'''),
(4, 'fill_blank', '例: ～てもいいです', 'この本を（　　）てもいいですか。', '["読む", "見る", "聞く", "書く"]', '読む', 10, 'この本を読んでもいいですか means ''Can I read this book?'''),
(4, 'rearrange', '例: ～てもいいです', '学校に行かないで（　　）（　　）（　　）（　　）', '["いい", "です", "ても", "学校に行かないで"]', '学校に行かないでいいです', 10, '学校に行かないでいいです means ''It''s okay not to go to school.''');
