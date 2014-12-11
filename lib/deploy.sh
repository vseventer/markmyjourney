git stash
git --work-tree dist checkout --orphan gh-pages
git --work-tree dist rm -r "*"
git --work-tree dist add --all
git --work-tree dist commit -m 'Manual deploy.'
git push origin gh-pages
git checkout master -f
git branch -D gh-pages
git stash pop