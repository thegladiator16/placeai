"""Tests for resume parser service."""
import pytest
from services.parser import count_words, _extract_skills_simple


def test_count_words_basic():
    assert count_words("hello world foo bar") == 4


def test_count_words_empty():
    assert count_words("") == 0


def test_extract_skills_finds_known_skills():
    text = "Experienced in Python, React, PostgreSQL and Docker deployment on AWS."
    skills = _extract_skills_simple(text)
    assert "Python" in skills
    assert "React" in skills
    assert "PostgreSQL" in skills
    assert "Docker" in skills
    assert "AWS" in skills


def test_extract_skills_case_insensitive():
    text = "Proficient in python and REACT"
    skills = _extract_skills_simple(text)
    assert "Python" in skills
    assert "React" in skills


def test_extract_skills_returns_list():
    result = _extract_skills_simple("some random text")
    assert isinstance(result, list)
