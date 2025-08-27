🚀 Guia de configuração e execução do projeto Python

1️⃣ Criar o ambiente virtual
No diretório do projeto Python:

```powershell
python -m venv venv
```

Isso cria a pasta venv/ com um ambiente Python isolado.

---

2️⃣ Ajustar a política de execução do PowerShell (primeira vez apenas)
Se ao ativar o venv aparecer o erro de "execução de scripts foi desabilitada", faça:

Abrir PowerShell como Administrador e executar:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```
Confirme digitando Y e pressionando Enter.
(Isso é necessário apenas uma vez na máquina.)

---

3️⃣ Ativar o ambiente virtual
No PowerShell (na pasta do projeto):

```powershell
.\venv\Scripts\Activate
```
Quando ativado, o terminal mostrará algo como:

```
(venv) PS C:\caminho\do\projeto>
```
Dica: Para desativar, digite:

```powershell
deactivate
```

---

4️⃣ Instalar dependências
Com o venv ativo:

```powershell
pip install -r requirements.txt
```

---

5️⃣ Rodar o programa principal
Ainda com o venv ativo:

```powershell
python -m python_scripts.main
```
Isso vai executar o script principal do projeto.

---

6️⃣ Resumo rápido dos comandos
```powershell
# Criar venv
python -m venv venv

# (Se necessário) Liberar execução de scripts
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

# Ativar venv
.\venv\Scripts\Activate

# Instalar pacotes
pip install -r requirements.txt

# Rodar main
python -m python_scripts.main
```
