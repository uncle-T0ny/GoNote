# GoNote
to run project install packages:
pip install -r requirements.txt


for security reasons you need specify OS variables such will use in settings.py as os.environ['KEY']

export DB_HOST="Value"
export DB_NAME="Value"
export DB_PASSWORD="Value"
export DB_USER="Value"
export DJANGO_APP_SECRET_KEY="Value"


TODO:
    create js converter from json object from server to json object for jstree plugin

    - добавить попапы при создании папки/заметки

    - добавить возможность создавать категории,

        CRUD для категорий,
        переименование категорий
        возможность перетаскивать папки/заметки
        валидация при удалении папки, если папка не пустая- не разрешать удалять


    - Поиск по содержимому заметок.

    - Исправить сообщения сохранения/удаления записей, логику сохранения удаления.

    - Добавить регистрацию пользователей

    - добавить OAuth авторизацию google, github

    - Добавить инструкцую по развертыванию приложения.

    - Добавить локализацию.

    - Найти логотип, стилизировать сайт.


