package fr.curie.navicell.database.data;

public class NaviCellDataException extends Exception {
    public NaviCellDataException(String message) {
        super(message);
        System.err.println("Exception : " + message);

    }
}