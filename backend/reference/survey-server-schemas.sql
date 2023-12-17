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