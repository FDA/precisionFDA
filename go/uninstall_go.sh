echo ">>Removing env settings from '$HOME/.bash_profile'"
sed -i.bak "/export PATH=\"\$PATH:\/usr\/local\/go\/bin:\$HOME\/go\/bin\"/d" "$HOME/.bash_profile"
sed -i.bak "/export GOPATH=\"\$HOME\/go\"/d" "$HOME/.bash_profile"

echo ">>Deleting folder '$HOME/go"
rm -rf $HOME/go
echo ">>Deleting folder '/usr/local/go'"
rm -rf /usr/local/go

echo ">>Done! Go is now uninstalled."
