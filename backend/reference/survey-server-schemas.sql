-- add survey function
drop function if exists addSurvey;

create function addSurvey(username text, surveyname text)
returns integer
as $$
	insert into surveys (creator_id,name)
        values (
            (select id from creators where name=username),
            surveyname)
        returning id;
$$ language sql

-- usage
select addSurvey('user1', 'testaddfunc') as id

----------------------------------------------------


-- add question function
drop function if exists addQuestion;

create function addQuestion(survey_id int, question_text text, answer_type text)
returns int
as $$
	insert into questions (survey_id, question, answer_type)
	values (survey_id,question_text, answer_type)
	returning id;
$$ language sql

-- usage
select addQuestion(1, 'my q text', 'yes/no') as id

----------------------------------------------------


-- get user surveys func

drop function if exists getUserSurveys;

create function getUserSurveys(username text)
returns table(name text)
as $$
	SELECT surveys.name
	FROM creators
	JOIN surveys
	ON creators.id = surveys.creator_id
	WHERE creators.name = username;
$$ language sql;

select getUserSurveys('user1') as surveyname