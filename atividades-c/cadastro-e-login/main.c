/*
 * PROJETO DE EXTENSAO EM DESENVOLVIMENTO DE SOFTWARE - UNINOVE
 * Empresa: KaTchau Games & Gear (loja virtual de consoles, jogos e perifericos)
 * Programa: Cadastro e login de usuarios (console)
 * Disciplina: Algoritmos e Praticas de Programacao
 *
 * Grupo:
 *   Joao Pedro Souza Nunes - RA 925115612
 *   Rhuan Machado Inocencio Raimundo - RA 925102998
 *   Luis Felipe Santos Dos Anjos - RA 925116420
 *   Eugenio Kafuma Antonio Nobrega - RA 925108741
 *   Heitor Ribeiro Espindola - RA 925114780
 *   Jhonatan Dourado Araujo - RA 926208072
 *
 * Repositorio: https://github.com/Jpsn-Dev/katchau-games
 * Compilar: gcc main.c -o programa     Executar: ./programa
 */

#include <stdio.h>
#include <string.h>

int main() {

    int opcao = -1;
    int cadastrado = 0;

    // Variaveis usadas no cadastro
    char usuarioCadastrado[50];
    char emailCadastrado[100];
    char senhaCadastrada[50];

    // Variaveis usadas no login
    char emailLogin[100];
    char senhaLogin[50];

    do {

        // mostrar o menu
        printf("\n===== MENU PRINCIPAL =====\n");
        printf("1 - Cadastro\n");
        printf("2 - Login\n");
        printf("0 - Sair\n");
        printf("Escolha: ");
        scanf("%d", &opcao);

        if (opcao == 1) {

            printf("\n===== CADASTRO =====\n");
            // recebe o nome do usuario
            printf("Usuario: ");
            scanf("%49s", usuarioCadastrado);

            // verifica se o usuario possui no minimo 3 caracteres
            if (strlen(usuarioCadastrado) < 3) {

            printf("\nUsuario invalido! Digite no minimo 3 caracteres.\n");
             break;

            }
   

            // recebe e verifica o email
            printf("Email: ");
            scanf("%99s", emailCadastrado);

            if (strstr(emailCadastrado, "@gmail.com") == NULL) {

                printf("\nEmail invalido! Utilize @gmail.com\n");
                break;

            }

            // recebe e verifica a senha
            printf("Senha: ");
            scanf("%49s", senhaCadastrada);

            // verifica se a senha possui no minimo 4 caracteres
            if (strlen(senhaCadastrada) < 4) {

                printf("\nSenha invalida! Digite no minimo 4 caracteres.\n");
                break;

            }

            cadastrado = 1;

            // mostra os dados cadastrados
            printf("\n===== DADOS CADASTRADOS =====\n");
            printf("Usuario: %s\n", usuarioCadastrado);
            printf("Email: %s\n", emailCadastrado);
            printf("Senha: %s\n", senhaCadastrada);

            // pergunta se deseja continuar pa ir direto pro login ou voltar pra tela inicial
            printf("\n1 - Continuar para o Login\n");
            printf("0 - Sair\n");
            printf("Escolha: ");
            scanf("%d", &opcao);

            if (opcao == 1) {

                opcao = 2;

            }
            else {

                printf("\nPrograma encerrado.\n");
                break;

            }

        }

        if (opcao == 2) {

            printf("\n===== LOGIN =====\n");

            // verifica se existe um cadastro
            if (cadastrado == 0) {

                printf("Voce precisa realizar o cadastro primeiro!\n");

            }
            else {

                // solicita os dados para login
                printf("Email: ");
                scanf("%99s", emailLogin);

                printf("Senha: ");
                scanf("%49s", senhaLogin);

                // compara os dados digitados com os cadastrados
                if (strcmp(emailLogin, emailCadastrado) == 0 &&
                    strcmp(senhaLogin, senhaCadastrada) == 0) {

                    printf("\nLogin realizado com sucesso!\n");

                }
                else {

                    printf("\nEmail ou senha incorretos!\n");

                }

            }

            break;

        }

        else if (opcao == 0) {

            printf("\nPrograma encerrado.\n");
            break;

        }

        else if (opcao != 1) {

            printf("\nOpcao invalida!\n");
            break;

        }

    } while (1);

    return 0;
}
