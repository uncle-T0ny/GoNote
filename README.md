# GoNote

for psycopg2 need to install:

sudo apt-get install libpq-dev python-dev
sudo apt-get build-dep python-psycopg2

to run project install packages:
pip install -r requirements.txt

for security reasons you need specify OS variables such will use in settings.py as os.environ['KEY']

export DB_HOST="Value"
export DB_NAME="Value"
export DB_PASSWORD="Value"
export DB_USER="Value"
export DJANGO_APP_SECRET_KEY="Value"

export SOCIAL_AUTH_TWITTER_KEY="Value"
export SOCIAL_AUTH_TWITTER_SECRET="Value"
export SOCIAL_AUTH_FACEBOOK_KEY="Value"
export SOCIAL_AUTH_FACEBOOK_SECRET"="Value"

Project integrated with heroku.

TODO:
    
    - прикрутить jQuery File Upload
        https://blueimp.github.io/jQuery-File-Upload/

    - добавить валидацию файлов.
    
    - добавить сортировку папок/заметок

    - добавить возможность переименования папки

    - Поиск по содержимому заметок.

    - Добавить регистрацию пользователей

    - Добавить локализацию.

    - Реализовать TypeHead для поиска по дереву.
    
    - Возможность прикрепить к заметке изображение.

    - экспорт в html/pdf    
    
    - Импорт/Экспорт заметок в json.
    
    - Возможность вставить в заметку изображение(возможно через интеграцию с imperavi)
    
    - дабавить view mode. Режим просмотра заметок. Для удобного чтения, и отсутсвием редактирования. 
    
    - Возможность делится заметками. По url. 

