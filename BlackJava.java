package fr.u_psud.ief;

import java.util.Scanner;

/**
 * @author Jul ChristyEl Fataki
 *
 */
public class BlackJack {

	public BlackJack() {
		// TODO Auto-generated constructor stub
	}
	
	static int[] cartes = {1,2,3,4,5,6,7,8,9,10,10,10,10,
			1,2,3,4,5,6,7,8,9,10,10,10,10,
			1,2,3,4,5,6,7,8,9,10,10,10,10,
			1,2,3,4,5,6,7,8,9,10,10,10,10,
			1,1,1,1
	};
	
	static int myCard1 = 0;
	static int myCard2 = 0;
	static int myHand = 0;
	static int banqCard = 0;
	
	static String pass = "";
	
	static Scanner sc = new Scanner(System.in);
	
	public static int distribueCartes () {
		return (cartes[(int) (Math.random() * 100) % 52]);
	}
	 
	public static void startBlackJack () {
		myCard1 = distribueCartes();
		myCard2 = distribueCartes();
		System.out.println("Votre premiere carte : "+myCard1);
		System.out.println("Votre deuxieme carte : "+myCard2+"\n");
		
		banqCard = distribueCartes();
		System.out.println("La banque : "+banqCard+"\n");
		if (myCard1 == myCard2) {
			//Split
			System.out.println("Vous avez un split");
			System.out.println("Remisez ou pas (y/n)");
			
			//Test split
			pass = sc.nextLine();
			if (pass.equals("n")) {
				myHand = myCard1 + myCard2;
				gameBlackJack ();
			}
			else if (pass.equals("y")) {
				System.out.println("Coming Soon...");
			}
		}
		else {
			//BlackJack
			myHand = myCard1 + myCard2;
			gameBlackJack ();
		}
	}
		
	public static void gameBlackJack () {
		if (myHand > 21) {
			//Bust Lose
			System.out.println("Bust");
			System.out.println("Vous avez perdu");
			System.exit(0);
		}
		else if (myHand == 21) {
			//BlackJack Win
			System.out.println("BlackJack");
			System.out.println("Vous avez gagné");
			System.exit(0);
		}
		else if (myHand < 21) {
			//Try to get Cards again
			System.out.println("Votre score est : "+myHand);
			System.out.println("Voulez vous tirer une carte (y/n)");
			
			//New Hand
			pass = sc.nextLine();
			if (pass.equals("n")) {
				//banqCard = distribueCartes();
				banqueBlackJack();
			}
			else if (pass.equals("y")) {
				//Tirer une carte
				int tmp = distribueCartes();
				System.out.println("Votre nouvelle carte : "+tmp);
				myHand += tmp;
				System.out.println("Votre nouveau score est : "+myHand+"\n");
				
				//Refaire le jeu
				gameBlackJack ();
			}
			
		}
	}
	
	public static void banqueBlackJack () {
		int tmp = distribueCartes();
		System.out.println("Nouvelle carte de la banque : "+tmp);
		banqCard += tmp;
		System.out.println("Score de la banque : "+banqCard+"\n");
		if (banqCard > 21) {
			//Bust Lose
			System.out.println("Bust");
			System.out.println("Vous avez gagné contre la banque");
			System.exit(0);
		}
		else if (banqCard == 21) {
			//BlackJack Win
			System.out.println("BlackJack");
			System.out.println("Vous avez perdu contre la banque");
			System.exit(0);
		}
		else if (banqCard < 21 && banqCard >= 17) {
			//Try to get Cards again
			System.out.println("Fin du jeu");
			
			if (banqCard < myHand) {
				System.out.println("Vous avez gagné contre la banque");
				System.exit(0);
			}
			else {
				System.out.println("Vous avez perdu contre la banque");
				System.exit(0);
			}
		}
		else {
			banqueBlackJack ();
		}
	}
	
	public static void main(String[] args) {
		// TODO Auto-generated method stub
		System.out.println("Bienvenue dans BlackJack");
		System.out.println();
		startBlackJack ();
	}

}
