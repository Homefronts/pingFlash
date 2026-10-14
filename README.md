# pingFlash
                                 :=*######*+-:::::
                               :=@%=-::::-=+###*#%#=
                              :*@+:          :-=#@#=
                              =@+            *@*=:
                              *@=          ::::
                              #@@#=-:   :-+@*
                             :#@@+*%##**#%%@+
                             :@@%  ::----:=@+
                             =@@=         +@=
                            :%@%:         =@=
                           :#@@=          =@+ ::
                          -%@@*           -@*:*%-
                        :+@%%%:           :%@-:#@=
                      :=@%=*@-             -@*::+@+:
                     -#@+:=@+               +@=  =@%-
                   :+@*- :@%:               -@*   :*@=
                 :=@%-  :+@=                -@#: : :+@*:
                -#@+:  -#@@:                -@#      -@%-
              :=@#-  -#@*%@:                -@* --:   :*@=
             :*@= :=#@+::@@:                =@+ =@%=:  :+@+:
            :*@=:=@@+:  -@@:                *@-  :=%@=:  =@*:
           :*@=-%@=:    :@@-               :@%:    :=@%-  =@*:
           +@++@+:      :#@-               =@+       :*@+: +@+
          -@%%@=         +@+              :#@-         -%@=:#@-
          @@@%-          -@#:             =@*           :=@%@#:
           --:           :@@=            :#@-             :-=:
                         :%@%:           +@+
                         :#@@+          =@*:
                          +@@@=        -@#:
                         :*@=*@+:    :+@*: :::
                       :-*%=  =@@*++*@#=:  :**+=:
                    :=*@@*=-+*##+====- =#*+++*@@@%=
                    :+*##***+=-:       :--=+++++==-
                        ::
                   _________________________________________
                  (  _  _  ___  __  __ ___ ___ ___  ___  _  _ _____ ___  )
                  | | || |/ _ \|  \/  | __| __| _ \/ _ \| \| |_   _/ __| |
                  | | __ | (_) | |\/| | _|| _||   / (_) | .` | | | \__ \ |
                  | |_||_|\___/|_|  |_|___|_| |_|_\\___/|_|\_| |_| |___/ |
                  (______________________________________________________)


A Solution to an odd problem. 

Have you ever experienced being in too many discord servers and getting pinged from God knows where? 

If so, you're not alone and this plugin hopefully fixes it! :)

When you're pinged from schrodingers server, the plugin shows a visible pulse around the server, when you then hover over the server it shows the user who pinged you, the channel the message is in, and the contents of the message. (not including images.)

Vencord loads this from `src/userplugins/pingFlash/`, as a direct child of `userplugins`. Copy the `plugins/pingFlash` folder there. A junction whose target sits outside the Vencord checkout makes the build fail to resolve `@utils` and `@webpack`. Do not put this repository root into `src/userplugins`. An empty file or empty folder there makes the build throw `TypeError: Cannot read properties of undefined (reading 'localeCompare')`.

## Install

1. Install [Vencord from source](https://docs.vencord.dev/installing/).
2. Copy `plugins/pingFlash` to `src/userplugins/pingFlash`.
3. From the Vencord checkout, run `pnpm install --frozen-lockfile`, then `pnpm build`.
4. Quit Discord from the tray and open it again.
5. Turn on **pingFlash** under **User Settings**, then **Plugins**.

Release 0.2a is [Beacon](https://github.com/Homefronts/pingFlash/releases/tag/0.2a).

Official layout notes: [Basic Plugin Setup](https://docs.vencord.dev/plugins/) and [Installing custom plugins](https://docs.vencord.dev/installing/custom-plugins/).
