#!/usr/bin/env node

const { program } = require('commander');
const { exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

program
    .version('1.0.0')
    .description('CLI User Management Utility');

// Функция для обработки ошибок команд
async function handleCommand(command, successMessage) {
    try {
        const { stdout, stderr } = await execAsync(command);
        if (stderr) {
            console.error(`Ошибка: ${stderr}`);
        } else {
            console.log(successMessage || stdout);
        }
    } catch (error) {
        console.error(`Произошла ошибка: ${error}`);
    }
}

// Создание пользователя
program
    .command('create <username>')
    .description('Create a new user')
    .option('-p, --password <password>', 'Initial password for the user')
    .action(async (username, options) => {
        const passwordArg = options.password ? ` | passwd --stdin ${username}` : '';
        const command = `sudo useradd ${username}${passwordArg ? ` && echo "${options.password}"` : ''}`;

        if (options.password) {
            await handleCommand(`useradd ${username} && echo "${username}:${options.password}" | chpasswd`, `Пользователь ${username} создан с паролем.`);
        } else {
            await handleCommand(`useradd ${username}`, `Пользователь ${username} успешно создан.  Установите пароль командой 'passwd ${username}'.`);
        }

    });

// Удаление пользователя
program
    .command('delete <username>')
    .description('Delete an existing user')
    .action(async (username) => {
        await handleCommand(`userdel -r ${username}`, `Пользователь ${username} успешно удален.`);
    });

// Изменение пароля
program
    .command('password <username>')
    .description('Change the password for a user')
    .action(async (username) => {
        console.log(`Вызов 'passwd ${username}'.  Пожалуйста, введите новый пароль в интерактивном режиме.`);
        const { spawn } = require('child_process');
        const passwd = spawn('sudo', ['passwd', username], { stdio: 'inherit' });

        passwd.on('close', (code) => {
            if (code === 0) {
                console.log(`Пароль пользователя ${username} успешно изменен.`);
            } else {
                javascript
                console.error(`Не удалось изменить пароль пользователя ${username}.`);
            }
        });
    });

// Блокировка учетной записи
program
    .command('lock <username>')
    .description('Lock a user account')
    .action(async (username) => {
        await handleCommand(`usermod -L ${username}`, `Учетная запись ${username} заблокирована.`);
    });

// Разблокировка учетной записи
program
    .command('unlock <username>')
    .description('Unlock a user account')
    .action(async (username) => {
        await handleCommand(`usermod -U ${username}`, `Учетная запись ${username} разблокирована.`);
    });

// Добавление в группу
program
    .command('addgroup <username> <groupname>')
    .description('Add a user to a group')
    .action(async (username, groupname) => {
        await handleCommand(`usermod -a -G ${groupname} ${username}`, `Пользователь ${username} добавлен в группу ${groupname}.`);
    });

// Удаление из группы
program
    .command('removegroup <username> <groupname>')
    .description('Remove a user from a group')
    .action(async (username, groupname) => {
        await handleCommand(`gpasswd -d ${username} ${groupname}`, `Пользователь ${username} удален из группы ${groupname}.`);
    });

// Просмотр информации о пользователе
program
    .command('info <username>')
    .description('View information about a user')
    .action(async (username) => {
        await handleCommand(`id ${username}`, `Информация о пользователе ${username}:`);
    });

program.parse(process.argv);